import { MatPaginatorIntl } from '@angular/material/paginator';

export function getCustomPaginatorIntl(): MatPaginatorIntl {
    const paginatorIntl = new MatPaginatorIntl();

    paginatorIntl.nextPageLabel = 'Next page';
    paginatorIntl.previousPageLabel = 'Previous page';
    paginatorIntl.firstPageLabel = 'First page';
    paginatorIntl.lastPageLabel = 'Last page';

    return paginatorIntl;
}