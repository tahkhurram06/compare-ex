// Eagerly pulls in every phone photo (card "outer"/back shots and detail
// "front-back-side" combo shots) for Apple and Samsung, so we can look one
// up by filename from phones.json. Add new images by dropping a PNG
// anywhere under src/assets/Mobile-Images/ and referencing its filename
// in phones.json — no import needed here.
const modules = import.meta.glob(
  "../assets/Mobile-Images/**/*.{png,jpg,jpeg,webp}",
  { eager: true, import: "default" }
);

const imagesByFilename = {};
for (const path in modules) {
  const filename = path.split("/").pop();
  imagesByFilename[filename] = modules[path];
}

export function getPhoneImage(filename) {
  return imagesByFilename[filename] || null;
}