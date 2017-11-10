// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.
'use strict';

var SfDeviceClient = require('cds-device-sdk').SfDeviceClient;
var DeviceSample = require('./device_sample_helper.js');
var util = require('util');
var deviceId = 'iotdevicedemo303';
var devicePassword = '1';
var apiUri = 'https://msfapiservice.trafficmanager.net/';
var certificatePath = 'C:\\temp\\';

console.log('Connected Device Studio - Simple Node.js Device Sample');

//var sfDeviceClient = SfDeviceClient.createSfDeviceClient(deviceId, devicePassword, certificatePath);
var sfDeviceClient = SfDeviceClient.createSfDeviceClient(deviceId, devicePassword, certificatePath, apiUri);

var connectCallback = function (err) {
    if (err) {
        console.error('Could not connect: ' + err.message);
    } else {
        console.log('Client connected');

        var sendinterval = setInterval(function () {

            var companyid = DeviceSample.getCompanyId();
            var equipmentid = DeviceSample.getSampleEquipmentId();
            var messagecatalogid = DeviceSample.getSampleMessageCataId();

            var devicemessage = DeviceSample.getSampleDeviceMessage(companyid, equipmentid, messagecatalogid);

            console.log('sending message: ' + util.format(devicemessage));

            sfDeviceClient.sendEvent(messagecatalogid, devicemessage, printResultFor('send'));
        }, 5000);

        sfDeviceClient.on('message', function (msg) {
            console.log('Id: ' + msg.messageId + ' Body: ' + msg.data);

            sfDeviceClient.complete(msg, printResultFor('completed'));
        });

        sfDeviceClient.on('error', function (err) {
            console.error(err.message);
        });

        sfDeviceClient.on('disconnect', function () {
            clearInterval(sendInterval);
            sfDeviceClient.removeAllListeners();
            sfDeviceClient.open(connectCallback);
        });

        // Set callback for Desired Custom Properties
        sfDeviceClient.SetOnDesiredCustomPropertiesChanged(onDesiredCustomPropertiesChanged);

        // Get Desired Custom Properties
        getDesiredCustomProperties();

        // Get Reported Custom Properties
        getReportedCustomProperties();

        // Upload file to Blob
        //uploadFileToBlob();
    }
}

sfDeviceClient.open(connectCallback);

function uploadFileToBlob() {
    var fileName = 'log.txt';
    var filePath = 'C:\\temp\\' + fileName;
    var blobName = convertLocalTimeFormat() + '_' + fileName;

    sfDeviceClient.uploadToBlob(filePath, blobName, function (err) {
        if (err) {
            console.error('error uploading file: ' + err.constructor.name + ': ' + err.message);
        } else {
            console.log('Upload successful - ' + blobName);
        }
    });
}

function getDesiredCustomProperties() {

    sfDeviceClient.getDesiredCustomProperties(function (err, desiredCustomProperties) {
        if (err) {
            console.error('could not get desired custom properties.');
        } else {

            console.log("---- Desired Custom Properties: " + JSON.stringify(desiredCustomProperties));
        }
    });
}

function getReportedCustomProperties() {

    sfDeviceClient.getReportedCustomProperties(function (err, reportedCustomProperties) {
        if (err) {
            console.error('could not get reported custom properties.');
        } else {

            console.log("---- Reported Custom Properties: " + JSON.stringify(reportedCustomProperties));
        }
    });
}

function updateReportedCustomProperties(patch) {

    // Add some ready-only properties if need
    patch['ApplicationVersion'] = '1.2.5';
    patch['Others'] = 99;


    sfDeviceClient.updateReportedCustomProperties(patch, function (err) {

        if (err) {
            console.error('could not update reported custom properties.');
        } else {
            console.log('------ update reported custom properties');
        }
    })
}

function onDesiredCustomPropertiesChanged(delta) {

    console.log('---- OnDesiredCustomPropertiesChanged ----');
    Object.keys(delta).forEach(function (key) {

        console.log(key + ': ' + delta[key]);

        // do something here...


    });
    console.log('------------------------------------------');

    // Update Reported Custom Properties
    updateReportedCustomProperties(delta);
}

function convertLocalTimeFormat() {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var dt = now.getDate();
    var hour = now.getHours();
    var minutes = now.getMinutes();
    var seconds = now.getSeconds();

    if (dt < 10) dt = '0' + dt;
    if (month < 10) month = '0' + month;
    if (hour < 10) hour = '0' + hour;
    if (minutes < 10) minutes = '0' + minutes;
    if (seconds < 10) seconds = '0' + seconds;

    return year + '-' + month + '-' + dt + '_' + hour + minutes + seconds;
}

// Helper function to print results in the console
function printResultFor(op) {
    return function printResult(err, res) {
        if (err) console.log(op + ' error: ' + err.toString());
        if (res) console.log(op + ' status: ' + res.constructor.name);
    };
}
