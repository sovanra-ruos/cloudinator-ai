const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const previewMessage = document.getElementById('previewMessage');
const analyzeButton = document.getElementById('analyzeButton');
const instructions = document.getElementById('instructions');

imageInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview" class="max-h-48 max-w-full">`;
      previewMessage.style.display = 'none';
      analyzeButton.disabled = false;
    };
    reader.readAsDataURL(file);
  }
});

const imageUploadButton = document.getElementById('imageUploadButton');
imageUploadButton.addEventListener('click', () => {
  imageInput.click();
});

const dropZone = imagePreview.parentElement;
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('border-blue-500');
});
dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('border-blue-500');
});
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('border-blue-500');
  const file = e.dataTransfer.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview" class="max-h-48 max-w-full">`;
      previewMessage.style.display = 'none';
      analyzeButton.disabled = false;
    };
    reader.readAsDataURL(file);
  }
});

analyzeButton.addEventListener('click', () => {
  // Add your image analysis logic here
  console.log('Analyzing image with instructions:', instructions.value);
  // You would typically send the image data and instructions to a server for processing
});