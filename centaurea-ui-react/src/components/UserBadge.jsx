function UserBadge({ user, onSignOut }) {
  return (
    <div className="user-badge">
      <div className="user-badge__info">
        <div className="user-badge__name">{user.username}</div>
        <div className="user-badge__email">{user.email}</div>
      </div>
      <button className="user-badge__button" onClick={onSignOut}>
        Sign out
      </button>
    </div>
  );
}

export default UserBadge;
