import express from 'express';
import fs from 'fs';

const server = express();

let requestExpirationDates = [];
let nextExpirationDate = new Date();
let nextComparsionInterval = 1;

setInterval(() => { 
    if(nextExpirationDate <= new Date() && requestExpirationDates.length !== 0){
      requestExpirationDates.every(element => {
        if(element <= nextExpirationDate){
          requestExpirationDates.shift();
          updateNextExpirationDateAndComparsionInterval();
        }
        else
          return false;
      });
      writeOnFile();
    }

}, nextComparsionInterval);


readFileAndUpdateNumberOfRequests();

server.get('/requestCounter', (req, res) =>{

  let expirationDate = new Date(new Date().getTime() + 1000 * 60);
  if(requestExpirationDates.length === 0){
    nextExpirationDate = expirationDate;
  }
  requestExpirationDates.push(expirationDate);

  getRequests().then(
    (val) => { 
      return res.json(val);
    }
  )
});

function getRequests() {
  return new Promise((resolve) => {
    writeOnFile();
    resolve(requestExpirationDates.length);
  })
}

function writeOnFile() {
  fs.writeFile('./assets/requests.txt', requestExpirationDates.toString(), (err) => {
    if (err) throw new Error('Error writing to file.');
  });
}

function readFileAndUpdateNumberOfRequests() {
  fs.readFile('./assets/requests.txt', 'utf8', (err, data) => {
    if(err){
      if(err.code == 'ENOENT' )
        requestExpirationDates = [];      
      else        
        throw new Error('Error reading file.');      
    }
    else{
      updateRequestDatesWithFileContent(data);  
      updateNextExpirationDateAndComparsionInterval();
    }
  });
}

function updateRequestDatesWithFileContent(data){
  let dataArray = data.toString().split(",");
      dataArray.forEach(element => {
        if(isValidDate(new Date(element)))
          requestExpirationDates.push(new Date(element));        
      });      
}

function isValidDate(date) {
  return !isNaN(date);
}

function updateNextExpirationDateAndComparsionInterval() {
  nextExpirationDate = requestExpirationDates.length === 0 ? new Date() : requestExpirationDates[0];
  nextComparsionInterval = requestExpirationDates.length === 0 ? 1000*60 : nextExpirationDate - new Date();
}

server.listen(3000);



