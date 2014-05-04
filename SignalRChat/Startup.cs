using System;
using System.Threading.Tasks;
using Microsoft.Owin;
using Owin;
using Microsoft.AspNet.SignalR;

[assembly: OwinStartup(typeof(SignalRChat.Startup))]

namespace SignalRChat
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {

            string connectionString = "Endpoint=sb://signalrchat.servicebus.windows.net/;SharedSecretIssuer=owner;SharedSecretValue=jBRS0iKtZtMo5wTYT9SvR6pd9c01zzGskWZjZqc9f7Q=";
            GlobalHost.DependencyResolver.UseServiceBus(connectionString, "Chat");  

            app.MapSignalR();
        }
    }
}
