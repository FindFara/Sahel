using Microsoft.AspNetCore.Mvc;
using Sahel.Models;
using System.Diagnostics;

namespace Sahel.Controllers
{
    public class HomeController : Controller
    {
        private const string LoginName = "Chihiro";
        private const string LoginSessionKey = "LoginName";

        public IActionResult Index()
        {
            if (HttpContext.Session.GetString(LoginSessionKey) != LoginName)
            {
                return RedirectToAction(nameof(Login));
            }

            return View();
        }

        [HttpGet]
        public IActionResult Login()
        {
            if (HttpContext.Session.GetString(LoginSessionKey) == LoginName)
            {
                return RedirectToAction(nameof(Index));
            }

            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Login(string name)
        {
            if (string.Equals(name?.Trim(), LoginName, StringComparison.OrdinalIgnoreCase))
            {
                HttpContext.Session.SetString(LoginSessionKey, LoginName);
                return RedirectToAction(nameof(Index));
            }

            ModelState.AddModelError(nameof(name), "Name must be Chihiro.");
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
