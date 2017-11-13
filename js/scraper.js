const request = require('request'),
      cheerio = require('cheerio'),
      fs = require('fs'),
      dir = '../data',
      url = 'http://www.shirts4mike.com/shirts.php',
      baseUrl = 'http://www.shirts4mike.com/';

let allInfo = ['Title', 'Price', 'Image URL', 'Item URL', 'Time\n'],
    date = new Date(),
    year = date.getFullYear(),
    month = date.getMonth(),
    day = date.getDate(),
    formattedDate = `${year}-` + `${month}-` + `${day}`,
    fileName = `${formattedDate}.csv`;

let time = date.getTime(),
    hr = date.getHours();
    min = date.getMinutes();
    ampm = 'am';

    if(hr >= 12) {
        ampm = 'pm';
    }

let timeNow = `${hr}:${min} ${ampm}`;


//function to scrape details from page, passed into loop below
function getData(url) {
    request(url, function(error, response, body) {
        if(!error) {
            //load cheerio to make data easier to gather
            const $ = cheerio.load(body);

            //find, get and set data
            let title = $('.breadcrumb').text().substring(9).split(',')[0],
                price = $('.shirt-details > h1').text().substring(0,3),
                imgSrc = baseUrl + $('img').attr('src');

             //push data to array
             allInfo.push('\n' + title, price, imgSrc, url, timeNow);

             //Write to file
             fs.writeFile(`${dir}/${fileName}`, allInfo, function(error) {
                 if(error) {
                     console.log('Error: ' + error);
                 }
             });

        } else {
            console.log('Error: ' + error);
        }
    });
}


//Create data folder synchronously in root if doesn't already exist
if(!fs.existsSync(dir)){
    fs.mkdirSync(dir);
} else {
    //If CSV already exists, remove CSV synchronously
    fs.readdir(dir, (err, files) => {
        files.forEach(file => {
            if(file.includes('.csv')) {
                fs.unlinkSync(`${dir}/${file}`);
            }
        });
    })
}


//Get data
request(url, function(error, response, body) {
    //(if no error) Handle data
    if(!error) {
        const $ = cheerio.load(body),
              links = $('ul.products').find('a');

        let hrefsArr = [],
            hrefs = [];

            //Extract url info
            for(let prop in links) {
                hrefsArr.push(links[prop].attribs);
            }

            //Slice array to make sure only valid urls exist in array
            hrefsArr = hrefsArr.slice(0,8);

            //Organise and structure urls for use
            for(let i = 0; i < hrefsArr.length; i++){
                for(let prop in hrefsArr[i]) {
                    hrefs.push(baseUrl + hrefsArr[i][prop]);
                }
            }

            //Visit each url and scrape required data (see getData function above)
            for(let i = 0; i < hrefs.length; i++){
                getData(hrefs[i]);
            }

            console.log(`Your new file '${fileName}' has been saved in the '${dir}' folder.`);

    //If error
    } else {
        console.log(`There’s been a 404 error. Cannot connect to ${baseUrl}.`);
    }
});
