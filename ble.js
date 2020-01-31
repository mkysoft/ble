'use strict';
let printCharacteristic;

function handleError(error) {
    console.log(error);
        alert(error);
    printCharacteristic = null;
}

function sendTextData(qrdata) {
    let encoder = new TextEncoder("iso-8859-1");
    let ESC = String.fromCharCode(27);
    let GS = String.fromCharCode(29);
    let CENTER = ESC + "a" + String.fromCharCode(1);
    let BOLD = ESC + "E" +  String.fromCharCode(1);
    let SIZE = GS + String.fromCharCode(33);
    let SIZEX3 = SIZE + String.fromCharCode(34);
    let SIZEX8 = SIZE + String.fromCharCode(119);
    let NORMAL = ESC + "E" + String.fromCharCode(0);
    let CUT = ESC + "d" + String.fromCharCode(1) + GS + "V" + String.fromCharCode(66);
    let LF = String.fromCharCode(10); 
    let INITP = ESC + String.fromCharCode(64);

    //let qrdata = 'P000001';
    let qrdatalen = qrdata.length + 3;
    let qrdatapl = qrdatalen % 256;
    let qrdataph = Math.floor(qrdatalen / 256);
    
    let text = encoder.encode(INITP + CENTER); 
    text = Int8Array.from([...text, ...[29, 40, 107, 4, 0, 49, 65, 50, 0]]);
    text = Int8Array.from([...text, ...[29, 40, 107, 3, 0, 49, 67, 8]]);
    text = Int8Array.from([...text, ...[29, 40, 107, 3, 0, 49, 69, 48]]);
    text = Int8Array.from([...text, ...[29, 40, 107, qrdatapl, qrdataph, 49, 80, 48]]);
    text = Int8Array.from([...text, ...encoder.encode(qrdata)]);
    text = Int8Array.from([...text, ...[29, 40, 107, 3, 0, 49, 81, 48]]);
    text = Int8Array.from([...text, ...encoder.encode(SIZEX3 + ' ' + qrdata)]);       
    text = Int8Array.from([...text, ...encoder.encode(LF + LF + CUT)]);       

    return printCharacteristic.writeValue(text).then(() => {
    console.log('Write done.');
    });
}

function bleprint(barcode) {
    if (printCharacteristic == null) {
    navigator.bluetooth.requestDevice({
        filters: [{
        namePrefix: 'SP'
        }],
        optionalServices: ['49535343-fe7d-4ae5-8fa9-9fafd205e455']
    })
    .then(device => {
        console.log('> Found ' + device.name);
        console.log('Connecting to GATT Server...');
        return device.gatt.connect();
    })
    .then(server => server.getPrimaryService("49535343-fe7d-4ae5-8fa9-9fafd205e455"))
    .then(service => service.getCharacteristic("49535343-8841-43f4-a8d4-ecbe34729bb3"))
    .then(characteristic => {
        // Cache the characteristic
        printCharacteristic = characteristic;
        sendTextData(barcode);
    })
    .catch(handleError);
    } else {
        sendTextData(barcode);
    }
}