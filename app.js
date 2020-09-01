
var express = require('express')
var app = express()
var fs = require("fs")  //read file
const fetch = require("node-fetch")
const mysql = require('mysql2')

DBCon = () => {
    const con = mysql.createConnection({
        host: "localhost",
        user: 'root',
        password: '',
        database: 'crypto'

    })

    return con
}


const server = app.listen(8082, '10.72.16.148', function () {

    var host = server.address().address
    var port = server.address().port
    console.log("Application RUN At http://%s:%s", host, port)

})


const time = () => {

    let today = new Date();
    let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    let dateTime = date + ' ' + time;

    console.log(dateTime)


}


const callDatabaseInsert = (DataID, DataName, DataSymbol, DataCmc_rank, DataPrice, DataPercent_change_24h, saveURL) => {


    let con = DBCon()

    con.connect((err) => {

        if (err) throw err

        sql = `insert into data(id,name,symbol,cmc_rank,prices,percent_change_24h,logo) values ('${DataID}','${DataName}','${DataSymbol}','${DataCmc_rank}','${DataPrice}','${DataPercent_change_24h}','${saveURL}')`


        con.query(sql, (err, result) => {
            if (err) throw err

            //console.log("Insert Complete")


            con.destroy()


            if ((DataCmc_rank == 100) && ((DataID && DataName && DataSymbol && DataCmc_rank && DataPrice && DataPercent_change_24h && saveURL) !== null)) {

                sel()

            }

        })

    })



}

const callDatabaseDel = () => {

    let con = DBCon()

    con.connect((err) => {

        if (err) throw err


        sql = 'DELETE FROM data WHERE 1'

        con.query(sql, (err, result) => {
            if (err) throw err

            //console.log("DELETE Complete")

            con.destroy()

            GetDataFromSever()
        })
    })


}




//client get Data via /getapi/data
app.get('/getapi/data', function (req, res) {

    callDatabaseDel()



    setTimeout(() => {


        fs.readFile(__dirname + "/" + "AllData.json", 'utf8', function (err, data) {



            let allData = JSON.parse(data)

            console.log(`Get from Client `) + time()

            res.end(JSON.stringify(allData))



        })

    }, 2000);







})



const GetDataFromSever = () => {


    const apiURL = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=100"

    fetch(apiURL,
        {

            method: 'GET',
            qs: {

            },
            headers: {
                'X-CMC_PRO_API_KEY': '631cf6a4-cd39-4359-8a31-c8142aac780a',
            },
            json: true,
            gzip: true
        })

        .then((res) => res.json())
        .then((resJson) => {

            let data = resJson.data


            for (let i = 0; i <= 99; i++) {
                var DataID = data[i].id
                var DataName = data[i].name
                var DataSymbol = data[i].symbol
                var DataCmc_rank = data[i].cmc_rank
                var DataPrice = data[i].quote.USD.price
                var DataPercent_change_24h = data[i].quote.USD.percent_change_24h
                var saveURL = `https://s2.coinmarketcap.com/static/img/coins/64x64/${data[i].id}.png`


                // console.log(`${DataID}  
                // ${DataName}  
                // ${DataSymbol}  
                // ${DataCmc_rank}  
                // ${DataPrice}  
                // ${DataPercent_change_24h}`)


                callDatabaseInsert(DataID, DataName, DataSymbol, DataCmc_rank, DataPrice, DataPercent_change_24h, saveURL)

            }



        })



}





const sel = () => {

    let con = DBCon()

    con.connect((err) => {

        if (err) throw err

        sql = 'SELECT name, symbol, cmc_rank, prices, percent_change_24h, logo, id FROM data WHERE 1 ORDER BY cmc_rank'

        con.query(sql, (err, result) => {
            if (err) throw err

            //console.log("SELECT Complete")
            //console.log(result)


            fs.writeFile('./AllData.json', JSON.stringify(result), function (err) {


                if (err) throw err


                //console.log("Saved! Data Done") + time()



            })

            con.destroy()


        })
    })

}






