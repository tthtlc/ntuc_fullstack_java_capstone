const MemberDetails = ({ member, onBack }) => {
  if (!member) return null;

  return (
    <div>
      <h2>Member Details</h2>
      <p><strong>ID:</strong> {member.id}</p>
      <p><strong>Name:</strong> {member.name}</p>
      <p><strong>Address:</strong> {member.address || 'N/A'}</p>
      <p><strong>Contact Info:</strong> {member.contactInfo}</p>
      <p><strong>Registration Date:</strong> {member.registrationDate}</p>
      <p><strong>Membership Expiry Date:</strong> {member.membershipExpiryDate}</p>
      <button onClick={onBack}>Back to List</button>
    </div>
  );
};

export default MemberDetails;