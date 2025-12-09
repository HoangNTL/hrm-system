const APIErrorMessage = ({ message }) => {
  if (!message) return null;
  return (
    <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/20">
      <p className="text-sm text-error">{message}</p>
    </div>
  );
};

export default APIErrorMessage;
