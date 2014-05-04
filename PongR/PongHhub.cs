using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;

namespace PongR
{
    public class PongHhub : Hub
    {
        public void Hello()
        {
            Clients.All.hello();
        }
    }
}