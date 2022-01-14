import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'

const UserIcon = ({ thumbUrl, figureClass }: { thumbUrl: string | null, figureClass: string }) => {
  if (thumbUrl != null) {
    return <figure className={"image " + figureClass}>
      <img className="is-rounded" src={thumbUrl} />
    </figure>
  } else {
    return <FontAwesomeIcon icon={faUser} />;
  }
}

export default UserIcon
