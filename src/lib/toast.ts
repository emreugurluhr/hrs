import Swal from 'sweetalert2';

export const showSuccess = (message: string) => {
  Swal.fire({
    icon: 'success',
    title: 'Başarılı',
    text: message,
    timer: 2000,
    showConfirmButton: false
  });
};

export const showError = (message: string) => {
  Swal.fire({
    icon: 'error',
    title: 'Hata',
    text: message
  });
};

export const showConfirm = async (title: string, text: string) => {
  const result = await Swal.fire({
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: 'Evet',
    cancelButtonText: 'İptal',
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33'
  });

  return result.isConfirmed;
};