const fs  = require('fs');
const {parse} = require('csv-parse');

fs.createReadStream("./Nutrition_data.csv")
  .pipe(parse({ columns : true,delimiter: ","}))
  .on("data", function (row) {
    console.log(row);
  })
  .on("end", function () {
    console.log("finished");
  })
  .on("error", function (error) {
    console.log(error.message);
  });
