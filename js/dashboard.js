// SERVICES PAGE
const servicePage = document.getElementById("service_page");

const portfolio = document.getElementById("portfolio_page");

const dashboardBtn = document.getElementById("dashboard_btn");

const home = document.getElementById("home");

const servicesPage = document.getElementById("servicesPage");

const portfolioPage = document.getElementById("portfolioPage");

// SHOW PORTFOLIO
portfolio.onclick = function () {

  home.classList.add("hidden");

  servicesPage.classList.add("hidden");

  portfolioPage.classList.remove("hidden");

  setTimeout(() => {

    portfolioPage.classList.remove(
      "opacity-0",
      "translate-y-10"
    );

    portfolioPage.classList.add(
      "opacity-100",
      "translate-y-0"
    );

  }, 100);

};

// SHOW SERVICES
servicePage.onclick = function () {

  home.classList.add("hidden");

  portfolioPage.classList.add("hidden");

  servicesPage.classList.remove("hidden");

  setTimeout(() => {

    servicesPage.classList.remove(
      "opacity-0",
      "translate-y-10"
    );

    servicesPage.classList.add(
      "opacity-100",
      "translate-y-0"
    );

  }, 100);

};

// SHOW DASHBOARD
dashboardBtn.onclick = function () {

  servicesPage.classList.add("hidden");

  portfolioPage.classList.add("hidden");

  home.classList.remove("hidden");

};

const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

addTaskBtn.addEventListener("click", addTask);

function addTask() {
    const taskText = taskInput.value.trim();

    if (taskText === "") return;

    const li = document.createElement("li");

    li.className =
        "flex items-center justify-between bg-gray-100 p-3 rounded-lg";

    li.innerHTML = `
        <div class="flex items-center gap-3">
            <input type="checkbox" class="task-check">
            <span class="task-text">${taskText}</span>
        </div>

        <button class="delete-btn text-red-500 hover:text-red-700">
            Delete
        </button>
    `;

    const checkbox = li.querySelector(".task-check");
    const taskTextElement = li.querySelector(".task-text");

    checkbox.addEventListener("change", () => {
        taskTextElement.classList.toggle("line-through");
        taskTextElement.classList.toggle("text-gray-500");
    });

    li.querySelector(".delete-btn").addEventListener("click", () => {
        li.remove();
    });

    taskList.appendChild(li);

    taskInput.value = "";
}