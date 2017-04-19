// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

var util = require('util');
var SfDeviceClient = require('smartfactory-device-sdk').SfDeviceClient;
var DeviceSample = require('./device_sample_helper.js');

var deviceId = 'nodedevice02';
var devicePassword = '1';
var apiUri = 'https://api.iot-smartfactory.net/';// Optional
var certificatePath = 'C:\\temp\\';

console.log('Smart Factory Took Kit - Simple IoT Device Sample');

//var sfDeviceClient = SfDeviceClient.createSfDeviceClient(deviceId, devicePassword, certificatePath);
var sfDeviceClient = SfDeviceClient.createSfDeviceClient(deviceId, devicePassword, certificatePath, apiUri);

var connectCallback = function (err) {
    if (err) {
        console.error('Could not connect: ' + err.message);
    } else {
        console.log('Client connected');

        sfDeviceClient.on('message', function (msg) {
            console.log('Id: ' + msg.messageId + ' Body: ' + msg.data);

            sfDeviceClient.complete(msg, printResultFor('completed'));
        });

        var sendInterval = setInterval(function () {

            var seed = Math.floor(Math.random() * 2);

            var companyId = DeviceSample.getCompanyId();
            var equipmentId = DeviceSample.getSampleEquipmentId(seed);
            var messageCatalogId = DeviceSample.getSampleMessageCataId(seed);

            var deviceMessage = DeviceSample.getSampleDeviceMessage(companyId, equipmentId, messageCatalogId);

            console.log('Sending message: ' + util.format(deviceMessage));

            sfDeviceClient.sendEvent(messageCatalogId, deviceMessage, printResultFor('send'));

        }, 5000);

        sfDeviceClient.on('error', function (err) {
            console.error(err.message);
        });

        sfDeviceClient.on('disconnect', function () {
            clearInterval(sendInterval);
            sfDeviceClient.removeAllListeners();
            sfDeviceClient.open(connectCallback);
        });
    }
}

sfDeviceClient.open(connectCallback);

// Helper function to print results in the console
function printResultFor(op) {
    return function printResult(err, res) {
        if (err) console.log(op + ' error: ' + err.toString());
        if (res) console.log(op + ' status: ' + res.constructor.name);
    };
}

