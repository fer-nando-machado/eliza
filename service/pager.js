app.service('pager', function($rootScope) {
    // service implementation
    this.getPager = function(totalItems, currentPage) {
      // default to first page
      currentPage = currentPage || 1;
  
      // default page size is 10
      var pageSize = $rootScope.config.pageSize || 10;

      // calculate total pages
      var totalPages = Math.ceil(totalItems / pageSize) || 1;
      var startPage = 1;
      var endPage = totalPages;
  
      // calculate start and end item indexes
      var startIndex = (currentPage - 1) * pageSize;
      var endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);
  
      // return object with all pager properties required by the view
      return {
        totalItems: totalItems,
        currentPage: currentPage,
        pageSize: pageSize,
        totalPages: totalPages,
        startPage: startPage,
        endPage: endPage,
        startIndex: startIndex,
        endIndex: endIndex,
        isFirstPage: function () {
          return currentPage == 1;
        },
        isLastPage: function () {
          return currentPage == totalPages;
        },
        hasPagination: function () {
          return totalPages > 1;
        }
      };
    }
  });
  