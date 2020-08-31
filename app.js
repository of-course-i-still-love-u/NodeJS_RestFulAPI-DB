
var express =  require('express')
var app = express()
var fs = require("fs")  //read file
const fetch = require("node-fetch")
const mysql = require('mysql2')

DBCon = () =>{
const con = mysql.createConnection({
    host:"localhost",
    user:'root',
    password:'',
    database:'crypto'

})

return con
}


const server = app.listen(8082,'172.20.10.5',function(){

    var host = server.address().address
    var port  = server.address().port
    console.log("Application RUN At http://%s:%s",host,port)

})


const time = () => {

    let today = new Date();
    let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    let dateTime = date+' '+time;

    console.log(dateTime)
    

}


const callDatabaseInsert = (DataID,DataName,DataSymbol,DataCmc_rank,DataPrice,DataPercent_change_24h) => {

    let con = DBCon()
   
    con.connect( (err)=>{
    
        if  (err) throw err
    //console.log('Database connected OK')

    sql =    `insert into data(id,name,symbol,cmc_rank,prices,percent_change_24h) values ('${DataID}','${DataName}','${DataSymbol}','${DataCmc_rank}','${DataPrice}','${DataPercent_change_24h}')`
     //sql = `update data set name = '${DataName}' `
     

    con.query(sql,(err,result)=>{
    if(err) throw err

    console.log("Insert Complete")
    //console.log("Update Complete")
    
    
        if((DataCmc_rank && DataPercent_change_24h && DataPrice  && DataSymbol &&DataName &&DataID) !== null  ){
            con.destroy()
            console.log('DBdestroy')
        }
  

        })
    })
  


}

const callDatabaseDel = () => {

    let con = DBCon()

    con.connect( (err)=>{
    
        if  (err) throw err
    //console.log('Database connected OK')

    sql = 'DELETE FROM data WHERE 1'
      
    con.query(sql,(err,result)=>{
    if(err) throw err

    console.log("DELETE Complete")
    
    
        })
    })
    

}




//client get Data via /getapi/data
app.get('/getapi/data',function(req,res){
    callDatabaseDel()

    GetDataFromSever()



    fs.readFile(__dirname+"/"+"AllData.json",'utf8',function(err,data){

       

            let allData = JSON.parse(data)
          
            console.log(`Get from Client ` )+time()
            
            res.end(JSON.stringify(allData))



    })

    
 
})



const GetDataFromSever =() =>{
    

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
    .then((resJson) =>{
    
        let data  =  resJson.data
      
    
        fs.writeFile('./AllData.json',JSON.stringify( data), function(err){
    
    
            if(err) throw err
    
            // console.log(data)
            console.log("Saved! Data Done")+time()
           
            
    
        })
    
       
    
        for(let i = 0 ; i <=99 ;i++){
        var DataID = data[i].id
        var DataName = data[i].name
        var DataSymbol = data[i].symbol
        var DataCmc_rank = data[i].cmc_rank
        var DataPrice = data[i].quote.USD.price
        var DataPercent_change_24h = data[i].quote.USD.percent_change_24h
        
        

        // console.log(`${DataID}  
        // ${DataName}  
        // ${DataSymbol}  
        // ${DataCmc_rank}  
        // ${DataPrice}  
        // ${DataPercent_change_24h}`)
         
    
        //console.log(typeof DataPrice,typeof DataPercent_change_24h)
        
        callDatabaseInsert(DataID,DataName,DataSymbol,DataCmc_rank,DataPrice,DataPercent_change_24h)
       
       
        }
        
        
       
     
    })
    

    
}










