// import https from 'https'
// https.get("https://metar.vatsim.net/ZBAA", (res) => {
//     res.on('data', (chunk: Buffer) => {
//         postMessage(chunk.toString())
//     })
// });
const httpRequest = new XMLHttpRequest();
onmessage = function(e){
    httpRequest.open('GET','https://metar.vatsim.net/'+e.data,true)
    httpRequest.setRequestHeader("Referer","https://metar.vatsim.net")
    httpRequest.send()
    httpRequest.onreadystatechange = function(){
        if(httpRequest.readyState == 4 && httpRequest.status == 200){
            console.log(httpRequest.responseText)
        }
    }
}