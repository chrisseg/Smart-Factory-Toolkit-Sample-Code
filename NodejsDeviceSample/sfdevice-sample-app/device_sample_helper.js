// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.
'use strict';

var EquipmentRunStatus = require('smartfactory-device-sdk').EquipmentRunStatus;

function convertLocalTimeFormat(now) {

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

    return year + '-' + month + '-' + dt + 'T' + hour + ':' + minutes + ':' + seconds;
};

module.exports = {
    getCompanyId: function getCompanyId() {
        // You can get the company id from JSON template        
        return 9;// Please put your COMPANY ID here
    },
    getSampleEquipmentId: function getSampleEquipmentId(seed) {
        // As an example, one or more equipments can be bound in the one device
        switch (seed) {
            case 0:
                return 'MachineTool-2f';
            case 1:
            default:
                return 'InjectionMachine-2f';
        }
    },
    getSampleMessageCataId: function getSampleMessageCataId(seed) {
        switch (seed) {
            case 0:
                return 45;// MachineTool-TypeA
            case 1:
            default:
                return 46; // InjectionMachine-TypeA
        }
    },
    getSampleDeviceMessage: function getSampleDeviceMessage(companyId, equipmentId, messageCatalogId) {

        var message = {
            companyId: companyId,
            msgTimestamp: convertLocalTimeFormat(new Date()),
            equipmentId: equipmentId,
            equipmentRunStatus: EquipmentRunStatus.Run
        };

        switch (messageCatalogId) {
            case 46:
                message['orderNumber'] = 'ORDER_123456';
                message['RPM-Expected'] = 5400;
                message['RPM-Actual'] = 5000;
                //message['CoolingSystemWarning'] = false;
                break;
            case 45:
                message['machineOnOff'] = true;
                message['orderId'] = 'ID12345';
                message['temperature'] = 23.1;
                message['RPM'] = 7200;
                message['bootingInfo_startTime'] = convertLocalTimeFormat(new Date(new Date().getTime() - 600000));
                message['bootingInfo_endTime'] = convertLocalTimeFormat(new Date());
                message['bootingInfo_materialStock'] = 999999;
                break;
        }

        return message;
    }
};