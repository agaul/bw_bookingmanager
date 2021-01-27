define(['jquery', 'TYPO3/CMS/Backend/Tooltip'], function ($) {

    if ($('.t3js-clearable').length) {
        require(['TYPO3/CMS/Backend/jquery.clearable'], function () {
            $('.t3js-clearable').clearable();
        });
    }

    $(document).ready(function () {
        $('a[data-togglelink="1"]').click(function (e) {
            e.preventDefault();
            $('#setting-container').toggle();
        });
    });

    $('#entryListForm').on('submit', function(e) {
      e.preventDefault();
      const url = e.currentTarget.getAttribute('action');
      const form = e.currentTarget;
      const formData = new FormData(form);
      const search = new URLSearchParams(formData);
      const queryString = search.toString();

      top.TYPO3.Backend.ContentContainer.setUrl(url + '&' + queryString);
  })

});
