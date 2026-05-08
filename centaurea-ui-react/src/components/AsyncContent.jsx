import StatusMessage from './StatusMessage';

function AsyncContent({
  isLoading = false,
  isFetching,
  isError = false,
  isEmpty = false,
  loadingMessage = 'Loading...',
  emptyMessage = 'No data available',
  children,
}) {
  // Error content is handled globally by NotificationProvider.
  if (isError) return null;

  if (isFetching ?? isLoading) {
    return <StatusMessage variant="loading">{loadingMessage}</StatusMessage>;
  }

  if (isEmpty) {
    return <StatusMessage variant="empty">{emptyMessage}</StatusMessage>;
  }

  return children ?? null;
}

export default AsyncContent;
