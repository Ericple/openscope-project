/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const elementId = require('./elementId');
const messageContainer = document.getElementById(elementId.RadarWindow.Footer.messageContainer);
let messageChannel = [];
function formatMessage(msg)
{
    let date = new Date();
    let min = date.getUTCMinutes();
    if(min<10) min="0"+min.toString();
    let sec = date.getUTCSeconds();
    if(sec<10) sec="0"+sec.toString();
    return `[${date.getUTCHours()}:${min}:${sec}] ${msg}`;
}
function getChannel(name)
{
    for (let index = 0; index < messageChannel.length; index++) {
        const channel = messageChannel[index];
        if(channel.name == name)
        {
            index = messageChannel.length;
            return channel;
        }
    }
}
function addChannel(name)
{
    messageChannel.push({
        name: name,
        messages: []
    });
}
function changeChannel(name)
{
    messageContainer.innerHTML = "";
    getChannel(name).messages.forEach((message) => {
        let el = document.createElement("a");
        el.innerText = formatMessage(message);
        el.className = "footer-message";
        messageContainer.appendChild(el);
    })
}
function addMessage(channel, message) 
{
    const messageEl = document.createElement("a");
    messageEl.innerText = formatMessage(message);
    messageEl.className = "footer-message";
    getChannel(channel).messages.push(formatMessage(message));
}

module.exports = {
    addChannel,addMessage,changeChannel
}