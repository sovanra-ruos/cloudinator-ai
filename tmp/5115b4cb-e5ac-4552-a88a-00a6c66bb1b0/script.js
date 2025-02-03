const imageUpload = document.getElementById('imageUpload');
const imagePreview = document.getElementById('imagePreview');
const uploadIcon = document.getElementById('uploadIcon');
const analyzeButton = document.getElementById('analyzeButton');
const analysisInstructions = document.getElementById('analysisInstructions');
const previewContainer = document.getElementById('previewContainer');
const noFileMessage = document.getElementById('noFileMessage');

imageUpload.addEventListener('change', () => {
  const file = imageUpload.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.src = e.target.result;
      img.classList.add('w-full', 'h-full', 'object-contain');
      imagePreview.innerHTML = '';
      imagePreview.appendChild(img);
      uploadIcon.style.display = 'none';
      noFileMessage.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }
});

analyzeButton.addEventListener('click', () => {
  // Add your image analysis logic here
  const instructions = analysisInstructions.value;
  //alert(`Analyzing image with instructions: ${instructions}`); 
});