const canvas = document.querySelector("#idCanvas");
const selectorCuloareBrush = document.querySelector("#selectorCuloareBrush");
const selectorCuloareBackground = document.querySelector(
  "#selectorCuloareBackground"
);
const salveazaJPG = document.querySelector("#salveazaJPG");
const salveazaSVG = document.querySelector("#salveazaSVG");
const cursor = document.querySelector("#cursor");
const tipCanvas = canvas.getContext("2d");

let marginiCanvas = canvas.getBoundingClientRect(); // pentru ca , canvasul nostru nu ocupa intreg spatiul paginii deci vom avea nevoie sa calculam coordonatele mouse-ului relative fata de pozitia canvasului.

// setarile default ale canvasului
canvas.style.cursor = "none";
tipCanvas.fillStyle = "#FFFFE5";
tipCanvas.fillRect(0, 0, 1000, 600);
tipCanvas.strokeStyle = "black";
tipCanvas.lineWidth = 3;
tipCanvas.lineCap = "round";
cursor.style.display = "none";
let deseneaza = false;
let deseneazaDreptunghi = false;
let deseneazaLinie = false;
let brush = true;
let imagineSalvata = new ImageData(1000, 600); // pentru a redesena canvasul (de exemplu: vreau sa desenez 2 dreptunghiu intr-un canvas si sa beneficiez si de o functionalitate de "preview" care imi arata unde va fi pozitionat dreptunghiul inainte ca acesta sa fie desenat )

//coordonate mouse
let mouse = {
  x: 0,
  y: 0,
};
// coordonate dreptunghi
let dreptunghi = {
  x: 0,
  y: 0,
  w: 0,
  h: 0,
};
// coordonate linie
let linie = {
  startX: 0,
  startY: 0,
  finalX: 0,
  finalY: 0,
};

// contoare pentru numarul de Brushuri , Dreptunghiuri , Linii desenate
let nrBrush = 0,
  nrDrept = 0,
  nrLinie = 0;

const listaBrush = document.querySelector("#listaBrush");
const listaDrept = document.querySelector("#listaDrept");
const listaLinie = document.querySelector("#listaLinie");

//interval care updateaza valorile contoarelor pe ecranul clientului
const listaFiguri = setInterval(() => {
  listaBrush.innerText = nrBrush;
  listaDrept.innerText = nrDrept;
  listaLinie.innerText = nrLinie;
}, 500);

// modelul unei figuri geometrice
function figuraGeom(x, y, w, h, finalX, finalY) {
  let k = 0;
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  (this.finalX = finalX), (this.finalY = finalY);
}
let figuri = [];

// functie pentru a calcula coordonatele mouse-ului in canvas
const coordonateMouse = (eveniment) => {
  mouse.x = eveniment.clientX - marginiCanvas.left;
  mouse.y = eveniment.clientY - marginiCanvas.top;
};

// functie pentru a salva canvasul
function SalveazaCanvas() {
  imagineSalvata = tipCanvas.getImageData(0, 0, canvas.width, canvas.height);
}
//functie pentru a redesena canvasul salvat precedent
function RedeseneazaCanvas() {
  // Restore image
  tipCanvas.putImageData(imagineSalvata, 0, 0);
}

// functie de start desen in canvas , in functie de tool-ul folosit(Linie,Brush,Dreptunghi) va desena punctul de start al figurii.
const start = (eveniment) => {
  deseneaza = true;
  coordonateMouse(eveniment);
  if (!deseneazaDreptunghi) {
    // brush tool
    SalveazaCanvas();
    tipCanvas.beginPath();
    tipCanvas.lineTo(mouse.x, mouse.y);
    tipCanvas.stroke();
  }
  if (deseneazaDreptunghi) {
    // dreptunghi
    SalveazaCanvas();
    tipCanvas.beginPath();
    dreptunghi.x = mouse.x; // coordonatele de start ale dreptunghiului
    dreptunghi.y = mouse.y;
  }
  if (deseneazaLinie) {
    //linie
    SalveazaCanvas();
    linie.startX = mouse.x; // coordonatele de start ale liniei
    linie.startY = mouse.y;
  }
};

// functie de stop desen in canvas , fiecare figura desenata va fi adauga intr-un vector de figuri
const stop = (eveniment) => {
  coordonateMouse(eveniment);
  deseneaza = false;
  if (deseneazaDreptunghi) {
    figuri.push(
      new figuraGeom(dreptunghi.x, dreptunghi.y, dreptunghi.w, dreptunghi.h)
    );
    nrDrept++;
  }
  if (deseneazaLinie) {
    figuri.push(
      new figuraGeom(
        linie.startX,
        linie.startY,
        0,
        0,
        linie.finalX,
        linie.finalY
      )
    );
    nrLinie++;
  }
  if (!deseneazaDreptunghi && !deseneazaLinie) {
    nrBrush++;
  }
};

// functie de curatare a canvasului
const deleteCanvas = () => {
  tipCanvas.fillRect(0, 0, canvas.width, canvas.height);
  nrLinie = 0;
  nrDrept = 0;
  nrBrush = 0;
};

// functia care efectueaza desenarea efectiva a figurilor , intre start si stop
const functieDeseneaza = (eveniment) => {
  coordonateMouse(eveniment);
  if (deseneaza && !deseneazaDreptunghi && !deseneazaLinie) {
    //brush
    RedeseneazaCanvas();
    tipCanvas.lineTo(mouse.x, mouse.y);
    tipCanvas.stroke();
  }
  if (deseneaza && deseneazaDreptunghi) {
    // dreptunghi
    dreptunghi.h = mouse.y - dreptunghi.y;
    dreptunghi.w = mouse.x - dreptunghi.x;
    RedeseneazaCanvas();
    tipCanvas.strokeRect(
      dreptunghi.x,
      dreptunghi.y,
      dreptunghi.w,
      dreptunghi.h
    );
  }
  if (deseneaza && deseneazaLinie) {
    //linie
    linie.finalX = mouse.x;
    linie.finalY = mouse.y;
    tipCanvas.fillRect(0, 0, canvas.width, canvas.height);
    RedeseneazaCanvas();
    tipCanvas.beginPath();
    tipCanvas.moveTo(linie.startX, linie.startY);
    tipCanvas.lineTo(linie.finalX, linie.finalY);
    tipCanvas.stroke();
  }
  cursor.style.left = eveniment.pageX + "px";
  cursor.style.top = eveniment.pageY + "px";
};

// deoarece canvas-ul este limitat cand vine vorba de stergerea unui element (si anume , poate sterge numai in forma de dreptunghi-x,y,width,height) am calculat in ce cadran se afla figura pentru a putea efectua stergea corect
const stergeFiguraRandom = () => {
  let nrRandom = Math.floor(Math.random() * figuri.length + 0); // numar random intre 0 si numarul de elemente din vectorul figuri
  let element = figuri[nrRandom];

  // verific daca am dreptunghi sau linie; o figura de tip dreptunghi nu va avea finalX si finalY definite
  if (
    typeof element.finalX === "undefined" &&
    typeof element.finalY === "undefined"
  ) {
    if (element.h < 0 && element.w < 0) {
      tipCanvas.fillRect(
        element.x + element.w - tipCanvas.lineWidth,
        element.y + element.h - tipCanvas.lineWidth,
        Math.abs(element.w) + tipCanvas.lineWidth + 6,
        Math.abs(element.h) + tipCanvas.lineWidth + 6
      );
    }
    if (element.w < 0 && element.h > 0) {
      tipCanvas.fillRect(
        element.x + element.w - tipCanvas.lineWidth,
        element.y - tipCanvas.lineWidth,
        Math.abs(element.w) + tipCanvas.lineWidth + 6,
        Math.abs(element.h) + tipCanvas.lineWidth + 6
      );
    }
    if (element.h < 0 && element.w > 0) {
      tipCanvas.fillRect(
        element.x - tipCanvas.lineWidth,
        element.y + element.h - tipCanvas.lineWidth,
        Math.abs(element.w) + tipCanvas.lineWidth + 6,
        Math.abs(element.h) + tipCanvas.lineWidth + 6
      );
    }
    tipCanvas.fillRect(
      element.x - tipCanvas.lineWidth,
      element.y - tipCanvas.lineWidth,
      element.w + tipCanvas.lineWidth + 6,
      element.h + tipCanvas.lineWidth + 6
    );
    figuri.splice(nrRandom, 1);
    nrDrept--;
  } else {
    if (element.y > element.finalY && element.x < element.finalX) {
      // suntem in cadranul 1
      tipCanvas.fillRect(
        element.x - tipCanvas.lineWidth,
        element.y + tipCanvas.lineWidth,
        element.finalX - element.x + tipCanvas.lineWidth + 6,
        element.finalY - element.y - tipCanvas.lineWidth - 6
      );
    }
    if (element.y > element.finalY && element.x > element.finalX) {
      // suntem in cadranul 2
      tipCanvas.fillRect(
        element.x + tipCanvas.lineWidth,
        element.y + tipCanvas.lineWidth,
        element.finalX - element.x - tipCanvas.lineWidth - 6,
        element.finalY - element.y - tipCanvas.lineWidth - 6
      );
    }
    if (element.y < element.finalY && element.x > element.finalX) {
      // suntem in cadranul 3
      tipCanvas.fillRect(
        element.x + tipCanvas.lineWidth,
        element.y - tipCanvas.lineWidth,
        element.finalX - element.x - tipCanvas.lineWidth - 6,
        element.finalY - element.y + tipCanvas.lineWidth + 6
      );
    }
    tipCanvas.fillRect(
      element.x - tipCanvas.lineWidth,
      element.y - tipCanvas.lineWidth,
      element.finalX - element.x + tipCanvas.lineWidth + 6,
      element.finalY - element.y + tipCanvas.lineWidth + 6
    );
    figuri.splice(nrRandom, 1);
    nrLinie--;
  }
};

// functie ce opreste "deseneaza" , utilizata cand mouse-ul va iesi de pe suprafata canvas-ului
const out = (eveniment) => {
  deseneaza = false;
};

//evenimente ce urmaresc cand utilizatorul face click(mousedown) , cand deseneaza(mousemove) , si cand se opreste din desenat(mouseup) , precum si cand acesta iese din zona delimitata de canvas(mouseout)
canvas.addEventListener("mousedown", start);
canvas.addEventListener("mouseup", stop);
canvas.addEventListener("mousemove", functieDeseneaza);
canvas.addEventListener("mouseout", out);

// schimbare culoare brush
selectorCuloareBrush.addEventListener("input", () => {
  tipCanvas.strokeStyle = selectorCuloareBrush.value;
  cursor.style.backgroundColor = selectorCuloareBrush.value;
});
// schimbare culoare background
selectorCuloareBackground.addEventListener("input", () => {
  tipCanvas.fillStyle = selectorCuloareBackground.value;
  tipCanvas.fillRect(0, 0, 1000, 600);
});
// modul de afisare al cursorulului deasupra canvas-ului (el ar fii fost altfel invizibil datorita setarii default pe care am aplicat-o la inceput)
canvas.addEventListener("mouseover", () => {
  cursor.style.display = "block";
});
// salveaza canvas-ul in format JPG
salveazaJPG.addEventListener("click", () => {
  const download = canvas.toDataURL("image/jpeg");
  salveazaJPG.href = download;
});
// salveaza canvas-ul in format SVG
salveazaSVG.addEventListener("click", () => {
  const download = canvas.toDataURL("image/svg");
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "image");
  svg.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", download);
  svg_string = svg.outerHTML;
  const string = `<svg xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" height="600" width="1000">${svg_string}</svg>`;
  const blob = new Blob([string], { type: MimeType }); // un obiect Blob , care contine datele care permit formearea SVG-ului
  const url = URL.createObjectURL(blob);
  salveazaSVG.href = url;
});

// creste marimea cursorului deasupra canvas-ului in functie de marimea brush-ului
const incrementBrush = () => {
  tipCanvas.lineWidth += 1;

  let inaltimeCursor = parseInt(
    window.getComputedStyle(cursor).getPropertyValue("height")
  );
  let latimeCursor = parseInt(
    window.getComputedStyle(cursor).getPropertyValue("width")
  );

  inaltimeCursor += 1.5;
  latimeCursor += 1.5;

  cursor.style.height = inaltimeCursor + "px";
  cursor.style.width = latimeCursor + "px";
};

// scade marimea cursorului deasupra canvas-ului in functie de marimea brush-ului
const decrementBrush = () => {
  tipCanvas.lineWidth -= 1;

  let inaltimeCursor = parseInt(
    window.getComputedStyle(cursor).getPropertyValue("height")
  );
  let latimeCursor = parseInt(
    window.getComputedStyle(cursor).getPropertyValue("width")
  );
  if (inaltimeCursor !== 1 && latimeCursor !== 1) {
    //previne ca marimea cursorului sa devina prea mica , incat acesta sa nu devina invizibil
    inaltimeCursor -= 1;
    latimeCursor -= 1;
    cursor.style.height = inaltimeCursor + "px";
    cursor.style.width = latimeCursor + "px";
  }
};

const tool = document.querySelectorAll(".selectTool");
const brushTool = document.querySelector("#brushTool");

// aplica un stil diferit pe butonul selectat curent
for (let i = 0; i < tool.length; i++) {
  tool[i].addEventListener("click", (e) => {
    let curent = document.querySelector(".activ");

    if (curent === e.target) {
      curent.className = curent.className.replace(" activ", "");
      brushTool.className += " activ";
    } else {
      curent.className = curent.className.replace(" activ", "");
      e.target.className += " activ";
    }
  });
}
// functie pentru activarea tool-ului de dreptunghi (din butoanele de pe client). Daca se deselecteaza tool-ul dreptunghi , brush-ul este tool-ul default.
const functieToolDreptunghi = () => {
  if (!deseneazaDreptunghi) {
    deseneazaDreptunghi = true;
    deseneazaLinie = false;
    brush = false;
  } else {
    deseneazaDreptunghi = false;
  }
  if (deseneazaLinie) {
    deseneazaDreptunghi = false;
    brush = false;
  }
};
// functie pentru activarea tool-ului de linie (din butoanele de pe client). Daca se deselecteaza tool-ul linie , brush-ul este tool-ul default.
const functieToolLinie = () => {
  if (!deseneazaLinie) {
    deseneazaLinie = true;
    deseneazaDreptunghi = false;
    brush = false;
  } else {
    deseneazaLinie = false;
  }
  if (deseneazaDreptunghi) {
    deseneazaLinie = false;
    brush = false;
  }
};

//functie pentru activarea tool-ului de brush.
const functieToolBrush = () => {
  if (!brush) {
    brush = true;
    deseneazaLinie = false;
    deseneazaDreptunghi = false;
  } else {
    brush = false;
  }
};

//la resize-ul ferestrei trebuie recalculate marginile canvasului pentru ca altfel am desena la coordonatele nepotrivite
window.addEventListener("resize", () => {
  marginiCanvas = canvas.getBoundingClientRect();
});
