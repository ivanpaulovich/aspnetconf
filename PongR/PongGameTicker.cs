using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using System.Collections.Concurrent;
using Microsoft.AspNet.SignalR.Hubs;
using System.Threading;

//
//
//

namespace PongR
{
    public class PongGameTicker
    {
        // Singleton instance
        private readonly static Lazy<PongGameTicker> _instance = new Lazy<PongGameTicker>(() => new PongGameTicker(GlobalHost.ConnectionManager.GetHubContext<PongGameHub>().Clients));
        private readonly object updatePositionsLock = new object();
        private readonly TimeSpan updateInterval = TimeSpan.FromMilliseconds(1000 / 25);
        private readonly Timer timer;
        private volatile bool updatingPositions = false;

        //
        // Propriedades da Mesa
        //
        private const double TableWidth = 800;
        private const double TableHeight = 450;

        //
        // Propriedades do Disco
        //
        private double DiskX = 0;
        private double DiskY = 0;
        private double VelX = 0;
        private double VelY = 0;
        private const double DiskMaxVelocity = 5;
        private const double DiskRadius = 20;
        private const double DiskAcceleration = 1.5;

        //
        // Propriedades da Pá
        //
        public double Paddle1Y = 0;
        public double Paddle2Y = 0;
        private const double PaddleMaxVelocity = 2;
        private const double PaddleWidth = 20;
        private const double PaddleHeight = 100;
        private const double PaddleOffSet = 5;

        private PongGameTicker(IHubConnectionContext clients)
        {
            Clients = clients;

            timer = new Timer(UpdateDiskPosition, null, updateInterval, updateInterval);

            Reset();
        }

        public static PongGameTicker Instance
        {
            get
            {
                return _instance.Value;
            }
        }

        private IHubConnectionContext Clients
        {
            get;
            set;
        }

        private void UpdateDiskPosition(object state)
        {
            lock (updatePositionsLock)
            {
                if (!updatingPositions)
                {
                    updatingPositions = true;

                    bool reset = false;
                    bool table = false;
                    bool paddle = false;

                    //
                    // Movimenta o disco
                    //
                    DiskX += VelX;
                    DiskY += VelY;

                    if (DiskX + DiskRadius < 0 || DiskX - DiskRadius > TableWidth)
                    {
                        //
                        // Saiu completamente da mesa pela esquerda ou pela direita
                        //

                        Reset();

                        reset = true;
                    }
                    else
                    {
                        Random rnd = new Random();

                        if (DiskY - DiskRadius < 0)
                        {
                            //
                            // Bateu na tabela superior então invertemos o sentido
                            //

                            DiskX -= VelX; // Retrocedemos o último movimento em X
                            DiskY = DiskRadius; // Definimos a última posição em Y
                            VelY = Math.Abs(VelY); // Aceleração positiva
                            table = true;
                        } 
                        else if (DiskY + DiskRadius > TableHeight)
                        {
                            //
                            // Bateu na tabela inferior então invertemos o sentido
                            //

                            DiskX -= VelX; // Retrocedemos o último movimento em X
                            DiskY = TableHeight - DiskRadius; // Definimos a última posição em Y
                            VelY = -Math.Abs(VelY); // Aceleração negativa
                            table = true;
                        }

                        if (DiskX - DiskRadius < PaddleOffSet + PaddleWidth)
                        {
                            //
                            // Passou pela Pá Esquerda
                            //
                            
                            if (DiskY - DiskRadius >= Paddle1Y && 
                                DiskY + DiskRadius <= Paddle1Y + PaddleHeight)
                            {
                                //
                                // A pá encostou no disco então 
                                // paramos o disco em X 
                                // invertemos e aumentamos a velocidade
                                //

                                DiskX = PaddleOffSet + PaddleWidth + DiskRadius;
                                DiskY -= VelY; // Voltamos a posição em Y

                                VelX *= -DiskAcceleration;
                                VelY *= DiskAcceleration;
                                paddle = true;
                            }
                        }
                        else if (DiskX + DiskRadius > TableWidth - (PaddleOffSet + PaddleWidth))
                        {
                            //
                            // Passou pela Pá Direita
                            //

                            if (DiskY - DiskRadius >= Paddle2Y && 
                                DiskY + DiskRadius <= Paddle2Y + PaddleHeight)
                            {
                                //
                                // A pá encostou no disco então 
                                // paramos o disco em X 
                                // invertemos e aumentamos a aceleração
                                //

                                DiskX = TableWidth - (PaddleOffSet + PaddleWidth) - DiskRadius;
                                DiskY -= VelY; // Voltamos a posição em Y

                                VelX *= -DiskAcceleration;
                                VelY *= DiskAcceleration;
                                paddle = true;
                            }
                        }
                    }

                    Clients.All.updatePositions(DiskX, DiskY, Paddle1Y, Paddle2Y, table, paddle, reset);

                    updatingPositions = false;
                }
            }
        }

        private void Reset()
        {
            DiskX = TableWidth / 2;
            DiskY = TableHeight / 2;

            Random rnd = new Random();

            VelX = Convert.ToSingle(((rnd.Next(0, 2) == 0) ? rnd.NextDouble() : (rnd.NextDouble() * -1)) * DiskMaxVelocity); 
            VelY = Convert.ToSingle(((rnd.Next(0, 2) == 0) ? rnd.NextDouble() : (rnd.NextDouble() * -1)) * DiskMaxVelocity); 

            if (VelX > -1.5 && VelX < 1.5)
                VelX = DiskMaxVelocity * 1.5f;

            if (VelY > -1.5 && VelY < 1.5)
                VelY = DiskMaxVelocity * 1.5f;

            Clients.All.reset(DiskX, DiskY);
        }

        //
        // Movimentos das Pás
        //
        public void Paddle1Up()
        {
            this.Paddle1Y -= PaddleMaxVelocity;
            if (this.Paddle1Y < 0)
                this.Paddle1Y = 0;
        }

        public void Paddle1Down()
        {
            this.Paddle1Y += PaddleMaxVelocity;
            if (this.Paddle1Y + PaddleHeight > TableHeight)
                this.Paddle1Y = TableHeight - PaddleHeight;
        }

        public void Paddle2Up()
        {
            this.Paddle2Y -= PaddleMaxVelocity;
            if (this.Paddle2Y < 0)
                this.Paddle2Y = 0;
        }

        public void Paddle2Down()
        {
            this.Paddle2Y += PaddleMaxVelocity;
            if (this.Paddle2Y + PaddleHeight > TableHeight)
                this.Paddle2Y = TableHeight - PaddleHeight;
        }
    }
}