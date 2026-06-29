import Button from './Button';
import FormLabel from './FormLabel';
import FormSelect from './FormSelect';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function Pagination({ table, totalCount }) {
  const { pageIndex, pageSize } = table.getState().pagination;

  return (
    <div className="grid__controls">
      <div className="grid__page-info">
        Page {pageIndex + 1} of {table.getPageCount()} ({totalCount} records)
      </div>
      <div className="grid__page-size">
        <FormLabel htmlFor="pagination-page-size">Rows per page</FormLabel>
        <FormSelect
          id="pagination-page-size"
          value={pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </FormSelect>
      </div>
      <div className="grid__buttons">
        <Button
          type="button"
          variant="secondary"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default Pagination;
