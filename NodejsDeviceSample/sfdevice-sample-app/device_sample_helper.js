// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.
'use strict';

var EquipmentRunStatus = require('cds-device-sdk').EquipmentRunStatus;

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
        return 69;// Please put your COMPANY ID here
    },
    getSampleEquipmentId: function getSampleEquipmentId() {
        return 'Equipment303';// Please put your EQUIPMENT ID here
    },
    getSampleMessageCataId: function getSampleMessageCataId() {
        return 79;// Please put your MESSAGE ID here
    },
    getSampleDeviceMessage: function getSampleDeviceMessage(companyId, equipmentId, messageCatalogId) {

        // System required
        var message = {
            companyId: companyId,
            msgTimestamp: convertLocalTimeFormat(new Date()),
            equipmentId: equipmentId,
            equipmentRunStatus: EquipmentRunStatus.Run
        };

        // Customzed
        message['MachineA_Color'] = 'RED';
        message['MachineA_StartTime'] = convertLocalTimeFormat(new Date());
        message['MachineB_Color'] = 'GREEN';
        message['MachineB_StartTime'] = convertLocalTimeFormat(new Date());

        return message;
    }
};