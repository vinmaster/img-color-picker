import './style.css';
// @ts-ignore
import quantize from 'quantize';
import { CanvasImage } from './CanvasImage';

const dropZone = document.getElementById('drop-zone');
const form = document.forms.namedItem('url-form');
const images = document.getElementById('images');
const urlInput = form?.getElementsByTagName('input').item(0) as HTMLInputElement;

main();

async function main() {
  dropZone?.addEventListener('dragenter', hoverToggle, false);
  dropZone?.addEventListener('dragleave', hoverToggle, false);
  dropZone?.addEventListener('dragover', disableEvent, false);
  dropZone?.addEventListener('drop', onDrop, false);

  form?.addEventListener('submit', onSubmit);
  let url = 'https://cdn.pixabay.com/photo/2022/05/01/15/02/art-7167741_960_720.png';
  urlInput.value = url;

  let buttons = document.querySelectorAll('.get-palette-button');
  buttons.forEach(b => b.addEventListener('click', getPalette, false));
}

function getPalette(e: Event) {
  let target = e.target as HTMLElement;
  let image = new CanvasImage(target.parentElement?.firstElementChild);
  let quality = 10;
  let colorCount = 5;
  let pixelArray = image.createPixelArray(quality);
  let cmap = quantize(pixelArray, colorCount);
  let palette = cmap.palette();
  let freq = frequencies(pixelArray, (arr: any[]) => arr.join(','));
  let colors = document.createElement('div');
  for (let p of palette) {
    let div = document.createElement('div');
    let [r, g, b] = p;
    let rgb = `rgb(${r},${g},${b})`;
    let count = freq[`${r},${g},${b}`];
    div.textContent = `${rgb} ${count}`;
    div.style.color = 'white';
    div.style.backgroundColor = rgb;
    div.style.height = '50px';
    colors.appendChild(div);
  }
  target.parentElement?.appendChild(colors);
  target.parentElement?.removeChild(target);
}

function frequencies(array: any[], getKey?: Function) {
  let map: Record<string, any> = {};
  for (let element of array) {
    let key = getKey ? getKey(element) : element;
    map[key] ??= [];
    map[key]++;
  }
  return map;
}

function disableEvent(e: Event) {
  e.stopPropagation();
  e.preventDefault();
}

function hoverToggle(e: DragEvent) {
  disableEvent(e);
  dropZone?.classList.toggle('hover');
}

function onSubmit(e: SubmitEvent) {
  disableEvent(e);
  loadImagesFromUrl(urlInput.value);
  return false;
}

async function loadImagesFromUrl(urls: string) {
  for (let url of urls.split(',')) {
    let res = await fetch(url);
    let data = await res.blob();
    let file = new File([data], '', { type: data.type || 'image/jpeg' });
    if (file.type.match('image.*')) {
      let data = await readFile(file);
      addImage(data);
    }
  }
}

function onDrop(e: DragEvent) {
  disableEvent(e);
  dropZone?.classList.toggle('hover');
  if (e.dataTransfer) loadImagesFromDrop(e.dataTransfer.files);
  return false;
}

async function loadImagesFromDrop(files: FileList) {
  for (let file of Array.from(files)) {
    if (file.type.match('image.*')) {
      let data = await readFile(file);
      addImage(data);
    }
  }
}

function addImage(data: string) {
  let div = document.createElement('div');
  div.classList.add('image-container');
  let img = document.createElement('img');
  img.src = data;
  div.appendChild(img);
  let button = document.createElement('button');
  button.textContent = 'Get palette';
  button.classList.add('get-palette-button');
  button.addEventListener('click', getPalette, false);
  div.appendChild(button);
  images?.appendChild(div);
}

function readFile(file: File): Promise<string> {
  return new Promise(resolve => {
    let reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

// function promisify(f: Function) {
//   return function (this: any, ...args: any) {
//     // return a wrapper-function (*)
//     return new Promise((resolve, reject) => {
//       function callback(err: any, result: unknown) {
//         // our custom callback for f (**)
//         if (err) {
//           reject(err);
//         } else {
//           resolve(result);
//         }
//       }

//       args.push(callback); // append our custom callback to the end of f arguments

//       f.call(this, ...args); // call the original function
//     });
//   };
// }
