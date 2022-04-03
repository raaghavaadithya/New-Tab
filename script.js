window.onload = () => {
  let brightness = 0;
  chrome.storage.sync.get("theme", function (color) {
    document.querySelector(".body").style.background = color["theme"];
  });

  chrome.storage.sync.get("color", function (o) {
    document.querySelector(".input-field").style.color = o["color"];
    document.querySelector(".theme-label").style.color = o["color"];
  });
};

document.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    let s = document.querySelector(".input-field").value;
    document.querySelector(".input-field").value = "";
    s = s.trim();

    if (s !== "") {
      if (s.startsWith("#new")) {
        let arr = s.split(" ");
        let key = arr[1];
        let val = arr[2];
        let obj = {};
        obj[key] = val;
        chrome.storage.sync.set(obj, function () {});
      } else if (s.startsWith("#list")) {
        let box = document.querySelector(".input-field");
        box.value = "";
        chrome.storage.sync.get(null, function (bookmarks) {
          Object.keys(bookmarks).forEach((item) => {
            if (item != "theme" && item != "color") {
              box.value += item + " : " + bookmarks[item] + "\n";
            }
          });
        });
      } else {
        chrome.storage.sync.get(null, function (bookmarks) {
          if (s in bookmarks) {
            window.location.href = bookmarks[s];
          } else {
            sendSearchReq(s);
          }
        });
      }
    }
  }
});
let colorPicker = document.querySelector(".theme");
colorPicker.addEventListener(
  "input",
  function (e) {
    document.querySelector(".body").style.background = e.target.value;
  },
  false
);

colorPicker.addEventListener(
  "change",
  function (e) {
    chrome.storage.sync.set({ theme: e.target.value }, function () {});
    brightness = getBrightness(e.target.value);
    let z = brightness < 128 ? "#fff" : "#000";
    chrome.storage.sync.set({ color: z }, function () {});
    document.querySelector(".input-field").style.color = z;
    document.querySelector(".theme-label").style.color = z;
  },
  false
);

let sendSearchReq = (s) => {
  let words = s.split(" ");

  let query = "";

  for (let i = 0; i < words.length; i++) {
    query += words[i];
    if (i !== words.length - 1) {
      query += "+";
    }
  }

  window.location.href = "https://www.google.com/search?q=" + query;
};

let getBrightness = (c) => {
  c = c.substring(1); // strip #
  let rgb = parseInt(c, 16); // convert rrggbb to decimal
  let r = (rgb >> 16) & 0xff; // extract red
  let g = (rgb >> 8) & 0xff; // extract green
  let b = (rgb >> 0) & 0xff; // extract blue

  let luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

  return luma;
};
