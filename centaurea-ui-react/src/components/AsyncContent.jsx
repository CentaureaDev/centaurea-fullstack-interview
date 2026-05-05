import StatusMessage from './StatusMessage';

function AsyncContent({
  isLoading = false,
  isFetching,
  isError = false,
  error,
  isEmpty = false,
  loadingMessage = 'Loading...',
  emptyMessage = 'No data available',
  children,
}) {
  if (isError) {
    return <StatusMessage variant="error">{error?.message}</StatusMessage>;
  }

  if (isFetching ?? isLoading) {
    return <StatusMessage variant="loading">{loadingMessage}</StatusMessage>;
  }

  if (isEmpty) {
    return <StatusMessage variant="empty">{emptyMessage}</StatusMessage>;
  }

  return children ?? null;
}

export default AsyncContent;
