import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'

const UserIcon = ({ thumbUrl }: { thumbUrl: string | null }) => {
  if (thumbUrl != null) {
    return <figure className="image is-24x24">
      <img className="is-rounded" src={thumbUrl} />
    </figure>
  } else {
    return <span className="icon"><FontAwesomeIcon icon={faUser} /></span>;
  }
}

export default UserIcon