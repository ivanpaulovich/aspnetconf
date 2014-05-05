using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace PongR
{
    public partial class Default : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {

        }

        protected string RetrievePlayer()
        {
            return !string.IsNullOrEmpty(Request["Player"]) ? (Request["Player"] == "1" ? "PlayerOne" : "PlayerTwo") : "PlayerOne";
        }

    }
}