"use strict";

const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2022-08-07T17:01:17.194Z",
    "2022-08-08T23:36:17.929Z",
    "2022-08-10T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2020-07-26T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

/////////////////////////////////////////////////
// Functions

//display dates
const formatMovementDate = function (date, locale) {
  //calculate how many days passed
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) {
    return `Today`;
  }
  if (daysPassed === 1) {
    return `Yesterday`;
  }
  if (daysPassed <= 7) {
    return `${daysPassed} days ago`;
  } else {
    return new Intl.DateTimeFormat(locale).format(date);
  }
};

//formatting currencies
const formatCur = function (value, locale, currency) {
  const options = {
    style: "currency",
    currency: currency,
  };

  return new Intl.NumberFormat(locale, options).format(value);
};

//adding new elements in movements container
const displayMovements = function (acc, sort = false) {
  //clear container before adding new elements
  containerMovements.innerHTML = "";

  const moves = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  moves.forEach(function (move, i) {
    const type = move > 0 ? "deposit" : "withdrawal";

    //loop movementsDates array - looping 2 arrays with same index
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    //format number
    const formattedMove = formatCur(move, acc.locale, acc.currency);

    const html = `
    <div class="movements__row">
    <div class="movements__type movements__type--${type}">
    ${i + 1} ${type}
    </div>
    <div class="movements__date">${displayDate}</div>
    <div class="movements__value">${formattedMove}</div>
    </div>`;

    //add created html : where to insert, what to insert
    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

//calculate balance
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce(function (acc, move) {
    return acc + move;
  }, 0);

  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

//calculate total income
const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter((move) => move > 0)
    .reduce((acc, move) => acc + move, 0);

  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const outcomes = acc.movements
    .filter((move) => move < 0)
    .reduce((acc, move) => acc + move, 0);

  labelSumOut.textContent = formatCur(
    Math.abs(outcomes),
    acc.locale,
    acc.currency
  );

  const interest = acc.movements
    .filter((int) => int > 0)
    .map((deposit) => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);

  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

//update UI
const updateUI = function (account) {
  //display movements
  displayMovements(currentAccount);
  //display total balance
  calcDisplayBalance(currentAccount);
  //display summary
  calcDisplaySummary(currentAccount);
};

//start timer
const startLogOutTimer = function () {
  //we put this in separate function because we want to call it immediately
  const tick = function () {
    //convert in minutes
    const min = String(Math.trunc(time / 60)).padStart(2, "0");
    const sec = String(time % 60).padStart(2, "0");

    //in each call print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    //when time will be 0 seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = "Log in to get started";
      containerApp.style.opacity = 0;
    }

    //decrease 1 second
    time--;
  };

  //set time to 5 minutes
  let time = 300;

  //call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

//compute usernames for accounts
const createUserNames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(" ")
      .map((name) => name[0])
      .join("");
  });
};
createUserNames(accounts); //stw

//Implementing login
let currentAccount, timer;

btnLogin.addEventListener("click", function (e) {
  //HTML default behavior: when clicking submit button it's reloading the page and submits form
  //prevent default reloading
  e.preventDefault();

  //assign current account to specified object to login
  currentAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === +inputLoginPin.value) {
    //display ui and welcome message
    labelWelcome.textContent = `Welcome Back, ${
      currentAccount.owner.split(" ")[0]
    }`;
    containerApp.style.opacity = 100;

    //create date for current date
    const now = new Date();
    const options = {
      hour: "numeric",
      minute: "numeric",
      day: "numeric",
      month: "numeric",
      year: "numeric",
    };

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    //clear the input fields
    inputLoginUsername.value = "";
    inputLoginPin.value = "";
    inputLoginPin.blur();

    //implement timer
    if (timer) {
      clearInterval(timer);
    }
    timer = startLogOutTimer();

    //updateUI
    updateUI(currentAccount);
  }

  sorted = false;
});

//implement money transfer
btnTransfer.addEventListener("click", function (e) {
  //remove html default behavior
  e.preventDefault();

  const sendAmount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    (acc) => acc.username === inputTransferTo.value
  );

  //clear inputs
  inputTransferAmount.value = "";
  inputTransferAmount.blur();
  inputTransferTo.value = "";

  //check the amount, receiver and sender accs
  if (
    sendAmount > 0 &&
    receiverAcc &&
    currentAccount.balance >= sendAmount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    //doing the transfer
    //add negative movement to sender
    currentAccount.movements.push(-sendAmount);
    //add positive movement to receiver
    receiverAcc.movements.push(sendAmount);

    //add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    //update UI
    updateUI(currentAccount);

    //reset the timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

//implement loan functionality
btnLoan.addEventListener("click", function (e) {
  //remove html default behavior
  e.preventDefault();

  const loanAmount = Math.floor(inputLoanAmount.value);

  if (
    loanAmount > 0 &&
    currentAccount.movements.some((move) => move >= loanAmount * 0.1)
  ) {
    setTimeout(function () {
      //add movement
      currentAccount.movements.push(loanAmount);

      //add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      //update ui
      updateUI(currentAccount);
    }, 2000);

    //reset the timer
    clearInterval(timer);
    timer = startLogOutTimer();

    inputLoanAmount.value = "";
    inputLoanAmount.blur();
  }
});

//implement delete account functionality
//findIndex method
btnClose.addEventListener("click", function (e) {
  //remove html default behavior
  e.preventDefault();

  if (
    currentAccount.username === inputCloseUsername.value &&
    currentAccount.pin === +inputClosePin.value
  ) {
    const index = accounts.findIndex(
      (acc) => acc.username === currentAccount.username
    );

    //DELETE ACCOUNT
    accounts.splice(index, 1);

    //hide UI
    containerApp.style.opacity = 0;

    //Change message
    labelWelcome.textContent = `Account Deleted`;
  }

  //clear input fields
  inputCloseUsername.value = "";
  inputClosePin.value = "";
  inputClosePin.blur();
});

//implementing movement sorting

let sorted = false;

btnSort.addEventListener("click", function (e) {
  //remove html default behavior
  e.preventDefault();

  //display movements
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});
