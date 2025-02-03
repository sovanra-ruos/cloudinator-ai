const imageUpload = document.getElementById('imageUpload');
const analyzeButton = document.querySelector('.bg-gray-500');
const preview = document.getElementById('preview');

imageUpload.addEventListener('change', (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    preview.innerHTML = `<img src="${e.target.result}" alt="Preview" class="max-w-full h-auto">`;
    analyzeButton.disabled = false;
  };

  reader.readAsDataURL(file);
});