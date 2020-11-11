const express = require('express')
const app = express()
const port = process.env.PORT || 5000

// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static('frontend/build'));
//   app.get('/', (req, res) => {
//     res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
// });
// }

app.get('/', (request, response) => {
 response.send('Hello World!');
 });

//CSV parse 
const fs = require('fs');
const parse = require('csv-parse/lib/sync');

const fileContent = fs.readFileSync(__dirname+'/hellometer_data.csv');
const records = parse(fileContent, {columns: true});

//API
app.get('/api/customers', (req, res) => {
    res.send(records)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

