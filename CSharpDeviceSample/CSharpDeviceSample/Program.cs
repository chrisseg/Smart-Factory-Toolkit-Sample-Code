using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Azure.Devices.Client;
using Microsoft.Azure.Devices.Shared;
using Microsoft.CDS.Devices.Client;
using Microsoft.CDS.Devices.Client.Enums;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Configuration;

namespace CSharpDeviceSample
{
    class Program
    {
        static SfDeviceClient _sfDeviceClient;

        static void Main(string[] args)
        {
            string DEVICE_ID = ConfigurationManager.AppSettings["Device.Id"];
            string DEVICE_PASSWORD = ConfigurationManager.AppSettings["Device.Password"];
            string CERTIFICATE_PATH = ConfigurationManager.AppSettings["CertificatePath"];// It can be null or empty if the x509 certificate did not be used.

            try
            {
                Console.WriteLine("DEVICE_ID={0}, DEVICE_PASSWORD={1}", DEVICE_ID, DEVICE_PASSWORD);

                HwProductKey hwProductKey = HwProductKey.CreateHwProductKey(DEVICE_ID, DEVICE_PASSWORD);

                /* Create the instance of SfDeviceClient */
                _sfDeviceClient = SfDeviceClient.CreateSfDeviceClient(hwProductKey, CERTIFICATE_PATH);

                /* initialzation */
                _sfDeviceClient.Initial().Wait();

                /* Setup the Customer properties callback */
                _sfDeviceClient.SetCustomerPropertiesUpdateCallbackAsync(OnDesiredCustomerPropertiesChanged).Wait();

                /* Async Task for getting device twin */
                GetTwinPropertiesAsync();

                /* Async Task for sending telemetry data */
                SendTelemetryBySchemaAsync();

                /* Async Task for receiving Cloud to Device message */
                ReceiveCloudToDeviceMessageAsync();

                /* Async Task for file uploading */
                //UploadFlieAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception: {0}", ex.Message);
                if (ex.InnerException != null)
                {
                    Console.WriteLine("InnerException: {0}", ex.InnerException.Message);
                    Console.WriteLine("InnerException StackTrace: {0}", ex.InnerException.StackTrace);
                }
            }

            Console.ReadLine();
        }

        static async Task OnDesiredCustomerPropertiesChanged(JObject desiredProperties)
        {
            Console.WriteLine("Desired Customer Property Change:");

            if (desiredProperties == null)
            {
                Console.WriteLine("desiredProperties: null");
                return;
            }

            JObject reportedCustomerProperties = new JObject();
            foreach (JProperty jp in desiredProperties.Properties())
            {
                processDesiredCustomerProperty(jp.Name, jp.Value);

                // Update the reported customer property
                reportedCustomerProperties.Add(jp.Name, jp.Value);
            }

            // Add some read-only properties
            reportedCustomerProperties.Add("BatteryCapacity", 50);// Read-only property
            reportedCustomerProperties.Add("ApplicationVersion", "1.2.3");// Read-only property

            await UpdateReportedCustomerPropertiesAsync(reportedCustomerProperties);
        }

        static void processDesiredCustomerProperty(string key, dynamic value)
        {
            Console.WriteLine("==== " + key + " - " + value);

            /* Do some customer codes for these changes */




        }

        static async Task UpdateReportedCustomerPropertiesAsync(JObject reportedProperties)
        {
            await _sfDeviceClient.UpdateReportedCustomerPropertiesAsync(reportedProperties);
        }

        static async void GetTwinPropertiesAsync()
        {
            /* Get Twin */
            Twin twin = await _sfDeviceClient.GetTwinAsync();
            if (twin != null)
            {
                Console.WriteLine("-- twin: {0}", JsonConvert.SerializeObject(twin));

                /* Get Desired Customer Properties */
                JObject desiredCustomerProperties = await _sfDeviceClient.GetDesiredCustomerPropertiesAsync();
                if (desiredCustomerProperties != null)
                    Console.WriteLine("---- Desired Customer Properties: {0}", desiredCustomerProperties.ToString());

                /* Get Reported Customer Properties */
                JObject reportedCustomerProperties = await _sfDeviceClient.GetReportedCustomerPropertiesAsync();
                if (reportedCustomerProperties != null)
                    Console.WriteLine("---- Reported Customer Properties: {0}", reportedCustomerProperties.ToString());
            }
        }

        static async void SendTelemetryBySchemaAsync()
        {
            /* For exsample, this is extracted by iotdevicedemo101-MessageTemplate.json */
            int companyId = 69; // <Put your company id>
            string equipmentId = "Equipment101"; // <Put your equipment id>
            int messageCatalogId = 73;// <Put your message catalog id>

            int messageCount = 1000;
            try
            {
                while (messageCount > 0)
                {
                    string deviceMessage = getSampleDeviceMessage(companyId, equipmentId, messageCatalogId);

                    await _sfDeviceClient.SendEventAsyncWithRetry(messageCatalogId, deviceMessage);

                    Console.WriteLine("{0} > Message Sending: {1}", DateTime.Now, deviceMessage);
                    messageCount--;

                    Task.Delay(5000).Wait();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("SendAsync Exception: {0}", ex.ToString());
            }
        }

        static string getSampleDeviceMessage(int companyId, string equipmentId, int messageCatalogId)
        {
            JObject deviceMessage = new JObject();
            deviceMessage.Add("companyId", companyId);
            deviceMessage.Add("msgTimestamp", DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss"));
            deviceMessage.Add("equipmentId", equipmentId);
            deviceMessage.Add("equipmentRunStatus", (int)EquipmentRunStatus.Run);

            /* Put your customized messages here
             * For exsample, this is extracted by iotdevicedemo101-MessageTemplate.json
            */
            deviceMessage.Add("Speed", new Random().Next() % 30);
            deviceMessage.Add("SerialNumber", "SN1234567890");
            deviceMessage.Add("Rpm", new Random().Next() % 100 + 5400);
            deviceMessage.Add("HealthStatus", "OK");   //OK or Stopped

            return deviceMessage.ToString();
        }

        static async void UploadFlieAsync()
        {
            string fileName = "screenshot.png";
            string filePath = "C:\\temp\\" + fileName;
            string blobName = DateTime.Now.ToString("yyyyMMdd_HHmmss") + "_" + fileName;

            try
            {
                var watch = System.Diagnostics.Stopwatch.StartNew();
                await _sfDeviceClient.UploadFileToBlob(filePath, blobName);
                watch.Stop();
                Console.WriteLine("blobName={0}, Time to upload file: {1}ms\n", blobName, watch.ElapsedMilliseconds);
            }
            catch (Exception ex)
            {
                Console.WriteLine("UploadFlieAsync Exception: {0}", ex.Message.ToString());
            }
        }

        static async void ReceiveCloudToDeviceMessageAsync()
        {
            while (true)
            {
                Message receivedMessage = await _sfDeviceClient.ReceiveAsync();
                if (receivedMessage == null) continue;// It returns null after a specifiable timeout period (in this case, the default of one minute is used)

                string msg = Encoding.ASCII.GetString(receivedMessage.GetBytes());

                Console.ForegroundColor = ConsoleColor.Yellow;
                Console.WriteLine("Received message: {0}\n", msg);
                Console.ResetColor();

                await _sfDeviceClient.CompleteAsync(receivedMessage);
            }
        }
    }
}
