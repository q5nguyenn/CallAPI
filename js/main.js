var myModal = new bootstrap.Modal(document.getElementById('modalAddProduct'), {
  keyboard: false,
});
$('#modalAddProduct').on('shown.bs.modal', function () {
  $('#name').focus();
});

$('#modalAddProduct').on('hide.bs.modal', function () {
  $('#name-error').html('&nbsp;');
});
var url = 'https://q5nguyennapi.azurewebsites.net/api/products';
var method = 'add';
var id = 0;
var currentElement;
var productNameOld;
$.ajax({
  type: 'GET',
  contentType: 'application/json; charset=utf-8',
  url: url,
  success: function (response) {
    let htmlString = '';
    response.forEach((element) => {
      htmlString += `<tr>
								<td>${element.id}</td>
								<td class="product-name">${element.productName}</td>
								<td>
									<button class="btn btn-warning mx-1 btn-edit" data-url="${element.id}">Sửa</button>
									<button class="btn btn-danger btn-delete" data-url="${element.id}">Xoá</button></td>
							</tr>`;
    });
    $('tbody').html(htmlString);
    hideLoading();
    // $('#myTable').dataTable({});
  },
});
//Delete
$(document).on('click', '.btn-delete', function (e) {
  e.preventDefault();
  let that = $(this);
  let urlDelete = url + '/' + $(this).data('url');
  console.log(that);
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#0d6efd',
    cancelButtonColor: '#dc3545',
    confirmButtonText: 'Yes, delete it!',
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        type: 'DELETE',
        contentType: 'application/json; charset=utf-8',
        url: urlDelete,
        success: function (response) {
          Swal.fire('Deleted!', 'Your file has been deleted.', 'success');
          that.closest('tr').fadeOut(300);
        },
      });
    }
  });
});
// Thêm
$('.btn-add').click(function (e) {
  $('#name').val('');
  method = 'add';
});
$(document).on('click', '.btn-edit', function (e) {
  currentElement = $(this);
  method = 'edit';
  id = $(this).data('url');
  let urlEdit = url + '/' + id;
  $.ajax({
    type: 'GET',
    contentType: 'application/json; charset=utf-8',
    url: urlEdit,
    success: function (response) {
      productNameOld = response.productName;
      $('#name').val(response.productName);
      myModal.show();
    },
  });
});
$('#form').submit(function (e) {
  showLoading();
  e.preventDefault();
  var name = $('#name').val();
  var encodedName = encodeURIComponent(name);
  if (method == 'add') {
    $.ajax({
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      // var url = 'https://q5nguyennapi.azurewebsites.net/api/products';
      url: url + '/exists/' + encodedName,
      success: function (response) {
        if (response == true) {
          $('#name-error').text('*Sản phẩm đã tồn tại!');
          hideLoading();
          return;
        } else {
          myModal.hide();
          var data = {
            productName: $('#name').val(),
          };
          data = JSON.stringify(data);
          $.ajax({
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            url: url,
            data: data,
            success: function (response) {
              var htmlResult = `<tr>
														<td>${response.id}</td>
														<td class="product-name">${response.productName}</td>
														<td>
															<button class="btn btn-warning mx-1 btn-edit" data-url="${response.id}">Sửa</button>
															<button class="btn btn-danger btn-delete" data-url="${response.id}">Xoá</button></td>
													</tr>`;
              $('tbody').append(htmlResult);
              hideLoading();
            },
          });
        }
      },
    });
  } else {
    var data = {
      id: id,
      productName: $('#name').val(),
    };
    if (productNameOld.toLowerCase() == $('#name').val().toLowerCase()) {
      hideLoading();
      myModal.hide();
      return;
    } else {
      $.ajax({
        type: 'GET',
        contentType: 'application/json; charset=utf-8',
        url: url + '/exists/' + encodedName,
        success: function (response) {
          if (response == true) {
            $('#name-error').text('*Sản phẩm đã tồn tại!');
            hideLoading();
            return;
          } else {
            data = JSON.stringify(data);
            $.ajax({
              type: 'PUT',
              contentType: 'application/json; charset=utf-8',
              url: url + '/' + id,
              data: data,
              success: function (response) {
                hideLoading();
                currentElement.closest('tr').find('.product-name').html($('#name').val());
                myModal.hide();
              },
            });
          }
        },
      });
    }
  }
});

// Show Loading
function showLoading() {
  $('.back-drop').show();
}
// Hide Loading
function hideLoading() {
  $('.back-drop').hide();
}
