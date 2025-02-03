const imageUpload = document.getElementById('imageUpload');
const dropzone = document.getElementById('dropzone');
const analyzeButton = document.getElementById('analyzeButton');
const previewImage = document.getElementById('previewImage');
const previewText = document.getElementById('previewText');

imageUpload.addEventListener('change', (event) => {
  const file = event.target.files[0];
  previewImage.src = URL.createObjectURL(file);
  previewImage.style.display = 'block';
  previewText.style.display = 'none';
  analyzeButton.disabled = false;
});

dropzone.addEventListener('dragover', (event) => {
  event.preventDefault();
  dropzone.classList.add('border-blue-500');
});

dropzone.addEventListener('dragleave', () => {
  dropzone.classList.remove('border-blue-500');
});

dropzone.addEventListener('drop', (event) => {
  event.preventDefault();
  dropzone.classList.remove('border-blue-500');
  const file = event.dataTransfer.files[0];
  previewImage.src = URL.createObjectURL(file);
  previewImage.style.display = 'block';
  previewText.style.display = 'none';
  analyzeButton.disabled = false;
});

analyzeButton.addEventListener('click', () => {
  // Add your image analysis logic here
  console.log('Analyzing image...');
});