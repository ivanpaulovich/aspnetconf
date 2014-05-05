using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;

namespace PongR
{
    public class PongGameHub : Hub
    {
        private readonly BallTicker _ballTicker;

        public PongGameHub() : this(BallTicker.Instance) { }

        public PongGameHub(BallTicker ballTicker)
        {
            _ballTicker = ballTicker;
        }

        public void MovePlayerOne(float vPos)
        {
            Clients.All.updatePositionPlayerOne(vPos);
        }

        public void MovePlayerTwo(float vPos)
        {
            Clients.All.updatePositionPlayerTwo(vPos);
        }
    }
}