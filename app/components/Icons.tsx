import type { PropsWithClassName } from "~/utils/PropsWithClassName";

const AcceptIcon = ({ className }: PropsWithClassName<{}>) =>
  <svg className={className} viewBox="0 0 30 30" fill="none"
       xmlns="http://www.w3.org/2000/svg">
    <circle cx="15" cy="15" r="15" fill="#27CE18"/>
    <path
      d="M14.2426 20.4204C13.5171 21.1458 12.3401 21.1458 11.615 20.4204L7.54406 16.3493C6.81865 15.6242 6.81865 14.4472 7.54406 13.7221C8.26912 12.9967 9.44616 12.9967 10.1716 13.7221L12.5971 16.1473C12.7802 16.3301 13.0774 16.3301 13.2609 16.1473L19.8284 9.57959C20.5535 8.85417 21.7305 8.85417 22.4559 9.57959C22.8043 9.92795 23 10.4006 23 10.8932C23 11.3858 22.8043 11.8585 22.4559 12.2068L14.2426 20.4204Z"
      fill="white"/>
  </svg>;

const AddIcon = ({ className }: PropsWithClassName<{}>) =>
  <svg className={className} viewBox="0 0 30 30" fill="none"
       xmlns="http://www.w3.org/2000/svg">
    <circle cx="15" cy="15" r="15" fill="#FF4040"/>
    <line x1="14.689" y1="23.1429" x2="14.689" y2="6.85717" stroke="white" strokeWidth="3"/>
    <line x1="6.85718" y1="14.7578" x2="23.1429" y2="14.7578" stroke="white" strokeWidth="3"/>
  </svg>;

const ArrowDownIcon = ({ className }: PropsWithClassName<{}>) =>
  <svg className={className}
       xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
       fill="none">
    <path fill="currentColor"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
  </svg>;

const DeclineIcon = ({ className }: PropsWithClassName<{}>) =>
  <svg className={className} viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="15" cy="15" r="15" fill="#FF4040"/>
    <line x1="20" y1="20" x2="10" y2="10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
    <line x1="10" y1="20" x2="20" y2="10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
  </svg>;

const EditIcon = ({ className }: PropsWithClassName<{}>) =>
  <svg className={className} viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="15" cy="15" r="15" fill="#4F4F4F"/>
    <path
      d="M19.5813 9.59953L21.6438 11.5902C21.7625 11.7089 21.7625 11.9027 21.6438 12.0214L14.8187 18.8464L12.5094 19.5058C12.1219 19.5495 11.7938 19.2214 11.8375 18.8339L12.325 16.4214L19.15 9.59953C19.2687 9.48078 19.4625 9.48078 19.5813 9.59953ZM23.8875 8.05578L23.1187 7.3589C22.6437 6.8839 21.8719 6.8839 21.3938 7.3589L20.2875 8.46515C20.1688 8.5839 20.1688 8.77765 20.2875 8.8964L22.35 10.887C22.4688 11.0058 22.6625 11.0058 22.7812 10.887L23.8875 9.78078C24.3625 9.30265 24.3625 8.53078 23.8875 8.05578ZM19 16.2402V20.9995H9V10.9995H16.1812C16.2812 10.9995 16.375 10.9589 16.4469 10.8902L17.6969 9.64015C17.9344 9.40265 17.7656 8.99953 17.4312 8.99953H8.5C7.67188 8.99953 7 9.6714 7 10.4995V21.4995C7 22.3277 7.67188 22.9995 8.5 22.9995H19.5C20.3281 22.9995 21 22.3277 21 21.4995V14.9902C21 14.6558 20.5969 14.4902 20.3594 14.7245L19.1094 15.9745C19.0406 16.0464 19 16.1402 19 16.2402Z"
      fill="currentColor"/>
  </svg>;

const EnvelopeIcon = ({ className }: PropsWithClassName<{}>) =>
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <path fill="currentColor" d="M469.333,64H42.667C19.135,64,0,83.135,0,106.667v298.667C0,428.865,19.135,448,42.667,448h426.667
			C492.865,448,512,428.865,512,405.333V106.667C512,83.135,492.865,64,469.333,64z M42.667,85.333h426.667
			c1.572,0,2.957,0.573,4.432,0.897c-36.939,33.807-159.423,145.859-202.286,184.478c-3.354,3.021-8.76,6.625-15.479,6.625
			s-12.125-3.604-15.49-6.635C197.652,232.085,75.161,120.027,38.228,86.232C39.706,85.908,41.094,85.333,42.667,85.333z
			 M21.333,405.333V106.667c0-2.09,0.63-3.986,1.194-5.896c28.272,25.876,113.736,104.06,169.152,154.453
			C136.443,302.671,50.957,383.719,22.46,410.893C21.957,409.079,21.333,407.305,21.333,405.333z M469.333,426.667H42.667
			c-1.704,0-3.219-0.594-4.81-0.974c29.447-28.072,115.477-109.586,169.742-156.009c7.074,6.417,13.536,12.268,18.63,16.858
			c8.792,7.938,19.083,12.125,29.771,12.125s20.979-4.188,29.76-12.115c5.096-4.592,11.563-10.448,18.641-16.868
			c54.268,46.418,140.286,127.926,169.742,156.009C472.552,426.073,471.039,426.667,469.333,426.667z M490.667,405.333
			c0,1.971-0.624,3.746-1.126,5.56c-28.508-27.188-113.984-108.227-169.219-155.668c55.418-50.393,140.869-128.57,169.151-154.456
			c0.564,1.91,1.194,3.807,1.194,5.897V405.333z"/>
  </svg>;

const SESFLogoIcon = ({ className }: PropsWithClassName<{}>) =>
  <svg className={className} xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
       viewBox="0 0 920 276">
    <g>
      <path style={{ fill: "currentColor" }} d="M183.8,71.1c-4.9-6.7-11.1-11.7-18.5-15.2c-7.4-3.5-15.7-5.2-24.8-5.2c-4.2,0-8.6,0.6-13.3,1.7c-4.7,1.1-8.9,3-12.8,5.5
		c-3.8,2.6-7,5.9-9.6,9.8c-2.6,3.9-3.9,8.8-3.9,14.4c0,7.4,2.9,13.3,8.7,17.6c5.8,4.3,13.9,8.3,24.2,12c11.3,3.9,21.5,8.3,30.3,13.1
		c8.9,4.8,16.4,10.3,22.6,16.5c6.2,6.2,10.9,13.1,14.1,20.9c3.2,7.8,4.8,16.6,4.8,26.5c0,15.8-3.3,29.2-9.8,40.3
		c-6.5,11.1-15,20.2-25.3,27.2c-10.4,7-22,12.2-34.8,15.4c-12.8,3.2-25.5,4.8-38.1,4.8c-9.4,0-18.7-0.9-28.1-2.6
		c-9.4-1.7-18.4-4.3-27-7.6c-8.6-3.3-16.6-7.6-24-12.8S4.7,242.4-0.5,235.7l45.5-37C50.2,206.6,57.8,213,68,218
		c10.1,4.9,20.4,7.4,30.7,7.4c5.4,0,10.7-0.6,15.7-1.7c5.1-1.1,9.6-3,13.5-5.5c3.9-2.6,7.1-5.9,9.4-10c2.3-4.1,3.5-8.9,3.5-14.6
		c0-9.1-3.7-16.3-11.1-21.6c-7.4-5.3-17.3-10-29.6-14.2c-8.6-3-16.7-6.3-24.2-10c-7.5-3.7-14.1-8.3-19.6-13.7
		c-5.5-5.4-10-11.9-13.3-19.4c-3.3-7.5-5-16.6-5-27.2C38,74,40.8,62,46.3,51.3c5.5-10.7,13.1-19.9,22.8-27.4
		c9.6-7.5,20.8-13.3,33.7-17.4c12.8-4.1,26.5-6.1,41.1-6.1c7.6,0,15.4,0.7,23.3,2.2c7.9,1.5,15.5,3.6,22.8,6.5
		c7.3,2.8,14,6.4,20.2,10.5c6.2,4.2,11.3,9,15.5,14.4L183.8,71.1z"/>
      <path style={{ fill: "currentColor" }}
            d="M232.2,269.4l46.2-262h167.6L436.9,60H328.1l-8.9,50.7h103.6l-8.9,49.6H310.3l-9.6,56.2h119.1l-9.2,52.9H232.2z"/>
    </g>
    <g>
      <path style={{ fill: "#FF0000" }} d="M506.9,7.9H586c14.8,0,29.5,2,44,6.1c14.6,4.1,27.6,10.5,39.2,19.2c11.6,8.8,21,20.1,28.1,34
		c7.2,13.9,10.7,30.7,10.7,50.1c0,22.9-4,43.8-12,62.5c-8,18.7-19.2,34.8-33.5,48.1c-14.3,13.3-31.2,23.6-50.7,30.9
		c-19.5,7.3-40.7,10.9-63.6,10.9h-87.7L506.9,7.9z M491,246.6h59.2c21.2,0,39.9-3.6,56.1-10.7c16.2-7.2,29.7-16.6,40.7-28.3
		c11-11.7,19.2-25.2,24.8-40.3s8.3-30.8,8.3-46.8c0-12.1-2-23.6-5.9-34.4c-3.9-10.9-10-20.4-18.1-28.5c-8.1-8.1-18.5-14.6-31.1-19.2
		c-12.6-4.7-27.5-7-44.8-7h-51.1L491,246.6z"/>
      <path style={{ fill: "#FF0000" }} d="M768.1,7.9h75.5c9.1,0,18.2,1,27.2,3c9,2,17.1,5.2,24.4,9.8c7.3,4.6,13.3,10.5,17.9,17.8
		c4.7,7.3,7,16.2,7,26.8c0,17.5-5.4,32-16.1,43.5c-10.7,11.5-24.7,19.3-42,23.5v0.7c14.3,2.2,26,8.2,35.1,17.9
		c9.1,9.7,13.7,22.4,13.7,37.9c0,13.3-2.8,25-8.3,35.2c-5.5,10.1-13.3,18.6-23.1,25.3c-9.9,6.8-21.6,11.9-35.3,15.4
		c-13.7,3.5-28.7,5.2-45,5.2h-77.3L768.1,7.9z M752.5,247.3h49.6c10.6,0,20.9-1,30.9-3.1c10-2.1,18.7-5.5,26.3-10.2
		c7.5-4.7,13.6-10.9,18.1-18.5c4.6-7.6,6.8-16.9,6.8-27.8c0-13.6-5.1-24.2-15.4-31.8c-10.2-7.6-24.9-11.5-43.8-11.5h-54.4
		L752.5,247.3z M774.4,122.6H828c6.9,0,14.2-0.9,21.8-2.6c7.6-1.7,14.6-4.6,20.9-8.7c6.3-4.1,11.5-9.4,15.5-15.9
		c4.1-6.5,6.1-14.7,6.1-24.6c0-7.2-1.4-13.3-4.3-18.3c-2.8-5.1-6.7-9.2-11.7-12.6c-4.9-3.3-10.8-5.7-17.6-7.2
		c-6.8-1.5-14.1-2.2-22-2.2h-46.2L774.4,122.6z"/>
    </g>
  </svg>;

const OrganisationIcon = ({ className }: PropsWithClassName<{}>) =>
  <svg className={className} viewBox="0 0 37 30" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7.4 20.625H1.85C0.828453 20.625 0 21.4646 0 22.5V28.125C0 29.1604 0.828453 30 1.85 30H7.4C8.42155 30 9.25 29.1604 9.25 28.125V22.5C9.25 21.4646 8.42155 20.625 7.4 20.625ZM6.0125 15.9375H17.1125V18.75H19.8875V15.9375H30.9875V18.75H33.7625V15.3756C33.7625 14.1352 32.7664 13.125 31.5419 13.125H19.8875V9.375H22.2C23.2215 9.375 24.05 8.53535 24.05 7.5V1.875C24.05 0.839648 23.2215 0 22.2 0H14.8C13.7785 0 12.95 0.839648 12.95 1.875V7.5C12.95 8.53535 13.7785 9.375 14.8 9.375H17.1125V13.125H5.45808C4.23361 13.125 3.2375 14.1346 3.2375 15.3756V18.75H6.0125V15.9375ZM21.275 20.625H15.725C14.7035 20.625 13.875 21.4646 13.875 22.5V28.125C13.875 29.1604 14.7035 30 15.725 30H21.275C22.2965 30 23.125 29.1604 23.125 28.125V22.5C23.125 21.4646 22.2965 20.625 21.275 20.625ZM35.15 20.625H29.6C28.5785 20.625 27.75 21.4646 27.75 22.5V28.125C27.75 29.1604 28.5785 30 29.6 30H35.15C36.1715 30 37 29.1604 37 28.125V22.5C37 21.4646 36.1715 20.625 35.15 20.625Z"
      fill="currentColor"/>
  </svg>;

const SearchIcon = ({ className }: PropsWithClassName<{}>) =>
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512.005 512.005">
    <path d="M505.749,475.587l-145.6-145.6c28.203-34.837,45.184-79.104,45.184-127.317c0-111.744-90.923-202.667-202.667-202.667
			S0,90.925,0,202.669s90.923,202.667,202.667,202.667c48.213,0,92.48-16.981,127.317-45.184l145.6,145.6
			c4.16,4.16,9.621,6.251,15.083,6.251s10.923-2.091,15.083-6.251C514.091,497.411,514.091,483.928,505.749,475.587z
			 M202.667,362.669c-88.235,0-160-71.765-160-160s71.765-160,160-160s160,71.765,160,160S290.901,362.669,202.667,362.669z"/>
  </svg>;


const SignInIcon = ({ className }: PropsWithClassName<{}>) =>
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <path fill="currentColor"
          d="M416 448h-84c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h84c17.7 0 32-14.3 32-32V160c0-17.7-14.3-32-32-32h-84c-6.6 0-12-5.4-12-12V76c0-6.6 5.4-12 12-12h84c53 0 96 43 96 96v192c0 53-43 96-96 96zm-47-201L201 79c-15-15-41-4.5-41 17v96H24c-13.3 0-24 10.7-24 24v96c0 13.3 10.7 24 24 24h136v96c0 21.5 26 32 41 17l168-168c9.3-9.4 9.3-24.6 0-34z"/>
  </svg>;

const TeamIcon = ({ className }: PropsWithClassName<{}>) =>
  <svg className={className} viewBox="0 0 44 31" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M6.6 13.3125C9.02688 13.3125 11 11.3506 11 8.9375C11 6.52441 9.02688 4.5625 6.6 4.5625C4.17313 4.5625 2.2 6.52441 2.2 8.9375C2.2 11.3506 4.17313 13.3125 6.6 13.3125ZM37.4 13.3125C39.8269 13.3125 41.8 11.3506 41.8 8.9375C41.8 6.52441 39.8269 4.5625 37.4 4.5625C34.9731 4.5625 33 6.52441 33 8.9375C33 11.3506 34.9731 13.3125 37.4 13.3125ZM39.6 15.5H35.2C33.99 15.5 32.8969 15.9854 32.0994 16.7715C34.87 18.2822 36.8363 21.0098 37.2625 24.25H41.8C43.0169 24.25 44 23.2725 44 22.0625V19.875C44 17.4619 42.0269 15.5 39.6 15.5ZM22 15.5C26.2556 15.5 29.7 12.0752 29.7 7.84375C29.7 3.6123 26.2556 0.1875 22 0.1875C17.7444 0.1875 14.3 3.6123 14.3 7.84375C14.3 12.0752 17.7444 15.5 22 15.5ZM27.28 17.6875H26.7094C25.2794 18.3711 23.6912 18.7812 22 18.7812C20.3088 18.7812 18.7275 18.3711 17.2906 17.6875H16.72C12.3475 17.6875 8.8 21.2148 8.8 25.5625V27.5312C8.8 29.3428 10.2781 30.8125 12.1 30.8125H31.9C33.7219 30.8125 35.2 29.3428 35.2 27.5312V25.5625C35.2 21.2148 31.6525 17.6875 27.28 17.6875ZM11.9006 16.7715C11.1031 15.9854 10.01 15.5 8.8 15.5H4.4C1.97313 15.5 0 17.4619 0 19.875V22.0625C0 23.2725 0.983125 24.25 2.2 24.25H6.73063C7.16375 21.0098 9.13 18.2822 11.9006 16.7715Z"
      fill="currentColor"/>
  </svg>;

const UserIcon = ({ className }: PropsWithClassName<{}>) =>
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
    <path fill="currentColor"
          d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"/>
  </svg>;

const StarIcon = ({ className }: PropsWithClassName<{}>) =>
  <svg className={className} fill="none" viewBox="0 -10 511.98645 511" xmlns="http://www.w3.org/2000/svg">
    <path
      d="m499.574219 188.503906c-3.199219-9.921875-11.988281-16.9375-22.398438-17.898437l-141.355469-12.84375-55.894531-130.835938c-4.117187-9.578125-13.503906-15.765625-23.933593-15.765625-10.433594 0-19.820313 6.207032-23.9375 15.808594l-55.890626 130.816406-141.378906 12.839844c-10.386718.941406-19.175781 7.957031-22.378906 17.878906-3.21875 9.921875-.234375 20.777344 7.617188 27.648438l106.859374 93.695312-31.511718 138.773438c-2.300782 10.199218 1.664062 20.734375 10.136718 26.878906 4.519532 3.328125 9.875 4.992188 15.230469 4.992188 4.628907 0 9.238281-1.234376 13.355469-3.710938l121.898438-72.894531 121.875 72.875c8.917968 5.351562 20.160156 4.882812 28.609374-1.238281 8.46875-6.144532 12.4375-16.683594 10.132813-26.882813l-31.507813-138.769531 106.859376-93.699219c7.847656-6.867187 10.835937-17.726563 7.613281-27.667969zm0 0"
      fill="currentColor"/>
    <path fill="#FCD34D"
          d="m114.617188 491.136719c-5.632813 0-11.203126-1.746094-15.957032-5.183594-8.855468-6.398437-12.992187-17.429687-10.582031-28.09375l32.9375-145.066406-111.703125-97.964844c-8.210938-7.1875-11.347656-18.515625-7.976562-28.90625 3.371093-10.367187 12.542968-17.726563 23.402343-18.730469l147.820313-13.417968 58.410156-136.746094c4.308594-10.046875 14.121094-16.535156 25.023438-16.535156 10.902343 0 20.714843 6.488281 25.023437 16.511718l58.410156 136.769532 147.796875 13.417968c10.882813.980469 20.054688 8.34375 23.425782 18.710938 3.371093 10.386718.253906 21.738281-7.980469 28.90625l-111.679688 97.941406 32.9375 145.066406c2.414063 10.667969-1.726562 21.695313-10.578125 28.09375-8.8125 6.378906-20.566406 6.914063-29.890625 1.324219l-127.464843-76.160156-127.445313 76.203125c-4.308594 2.582031-9.109375 3.859375-13.929687 3.859375zm141.375-112.871094c4.84375 0 9.640624 1.300781 13.953124 3.859375l120.277344 71.9375-31.085937-136.941406c-2.21875-9.769532 1.089843-19.925782 8.621093-26.515625l105.472657-92.523438-139.542969-12.671875c-10.003906-.894531-18.667969-7.1875-22.59375-16.46875l-55.101562-129.046875-55.148438 129.066407c-3.902344 9.238281-12.5625 15.53125-22.589844 16.429687l-139.519531 12.671875 105.46875 92.519531c7.554687 6.59375 10.839844 16.769531 8.621094 26.539063l-31.082031 136.941406 120.277343-71.9375c4.328125-2.558594 9.128907-3.859375 13.972657-3.859375zm-84.585938-221.824219v.019532zm169.152344-.066406v.023438s0 0 0-.023438zm0 0"/>
  </svg>;

const BattleNetIcon = ({ className }: PropsWithClassName<{}>) =>
  <svg className={className} viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path fill="currentColor" d="M14.8141 -3.0735e-05C14.0831 0.0283026 13.5972 0.444803 13.3224 0.740886C12.1791 1.97339 11.713 3.99639 11.6677 6.33955C11.237 5.60005 10.6477 4.83647 9.9691 4.64239C9.88944 4.6204 9.80784 4.60617 9.72544 4.59989C8.36827 4.40439 7.22077 6.5733 7.37377 10.0002C4.82377 10.0909 2.65627 10.3799 1.19285 10.744C0.935019 10.8077 0.750853 10.8856 0.597853 10.9621C0.491603 11.0117 0.416519 11.0613 0.342853 11.1095C0.113353 11.2596 0.0113525 11.3914 0.0113525 11.3914C0.677186 11.1406 3.35185 10.6901 7.42619 10.8431L7.42052 10.7794H7.42902C7.60752 12.6069 8.14019 14.7305 9.1786 17.0255V17.0297L9.1446 16.9674C8.4986 17.9888 6.60594 21.1083 6.00385 23.4557C5.61144 24.9871 5.71769 25.9661 6.02369 26.5979C6.39485 27.4337 7.10602 27.6972 7.55369 27.7992C9.21544 28.1789 11.237 27.5499 13.3167 26.3854C12.869 27.1461 12.4624 28.0911 12.6424 28.8065C12.6622 28.8855 12.6897 28.9623 12.7245 29.036C13.2388 30.3067 15.6868 30.2146 18.5768 28.3701C19.9198 30.5093 21.2429 32.2235 22.2828 33.3001C22.4669 33.4928 22.627 33.6161 22.7715 33.7096C23.1639 33.9858 23.4331 34 23.4331 34C22.8849 33.5523 21.1693 31.4783 19.2766 27.9041L19.227 27.9437C19.227 27.9409 19.2228 27.9366 19.2214 27.9352C20.7287 26.8586 22.3182 25.3186 23.7972 23.2461H23.8014L23.7618 23.2999L23.7589 23.3056C25.0283 23.3537 28.5898 23.4189 30.8848 22.7771C32.4006 22.3536 33.1939 21.777 33.5906 21.1976C34.1332 20.4566 34.0057 19.7044 33.8697 19.2638C33.3682 17.6346 31.8184 16.2038 29.7727 14.9826C30.6539 14.9897 31.6739 14.8693 32.2009 14.3579C32.2622 14.298 32.3173 14.2321 32.3652 14.161C33.1968 13.0786 31.8906 11.0061 28.8533 9.4293C30.0348 7.19664 30.8607 5.19489 31.2758 3.75697C31.3466 3.50339 31.3707 3.30505 31.3792 3.13364C31.4245 2.65339 31.3027 2.41255 31.3027 2.41255C31.1894 3.11097 30.2501 5.6298 28.101 9.05672L28.1591 9.08505L28.1563 9.0893C26.4704 8.3243 24.3412 7.71797 21.8068 7.4743L21.8039 7.47005L21.8748 7.47572C21.2826 6.3523 19.5614 3.23705 17.8599 1.57105C16.7379 0.473136 15.8398 0.0722193 15.1399 0.0169693C15.0319 0.00313505 14.923 -0.00254767 14.8141 -3.0735e-05ZM16.4744 3.74422C17.1275 3.75555 17.8004 4.25989 18.3558 4.78972C19.0514 5.45555 19.9297 6.73622 20.3561 7.38222C20.2385 7.37797 20.128 7.36239 20.0076 7.35955C17.3684 7.29297 15.4516 7.87805 14.0647 8.74789C14.1497 6.56197 14.6583 4.78122 15.8185 3.96805C16.0104 3.83055 16.2385 3.75269 16.4744 3.74422ZM10.6449 6.67247C10.6874 6.67247 10.7299 6.68239 10.7724 6.68947C11.135 6.78864 11.4396 7.1683 11.6819 7.59897C11.7144 8.39655 11.7881 9.21964 11.8944 10.0541C10.9566 9.99882 10.0174 9.97048 9.07802 9.96905C9.1361 8.0183 9.68435 6.69655 10.6449 6.67247ZM18.4054 8.38664C18.751 8.37672 19.1052 8.38239 19.4707 8.40505C22.4344 8.58214 25.2011 9.4208 27.1915 10.4493C26.724 11.1378 26.2055 11.8561 25.6474 12.5941C24.7959 11.05 23.5691 10.1291 23.001 9.8883C22.5066 9.6758 22.4032 9.68997 22.4032 9.68997C22.4032 9.68997 22.4499 9.6758 23.2107 10.2751C24.0309 10.9196 24.6925 11.8419 25.16 12.8321C22.6706 11.9177 20.1094 11.2121 17.5029 10.7227C16.6351 10.5623 15.7625 10.4286 14.8864 10.3218C14.8835 10.3374 14.8835 10.3686 14.8807 10.3856L14.8453 10.3799C14.8226 10.5371 14.7943 10.7723 14.7744 11.0316C14.7546 11.3149 14.7461 11.5387 14.7419 11.6719C14.9643 11.7144 15.1895 11.7541 15.4148 11.7994C18.6377 12.4369 22.8154 13.7558 25.8457 15.4771C25.8939 17.0396 25.3853 18.9011 24.1599 20.7556C22.525 23.2347 20.4142 25.2138 18.5272 26.4222C18.1441 25.6266 17.7818 24.8212 17.4406 24.0068C19.2341 24.0592 20.6734 23.4472 21.1721 23.0718C21.5971 22.7545 21.6396 22.6553 21.6396 22.6511C21.6382 22.6567 21.5971 22.7134 20.7329 23.0576C19.7469 23.4515 18.5938 23.562 17.4845 23.4614C19.5188 21.7648 21.4085 19.9021 23.1342 17.8925C23.7122 17.2153 24.2633 16.5226 24.7889 15.8241L24.7393 15.7887L24.7619 15.7618C24.4218 15.4948 24.065 15.2497 23.6938 15.028L23.2475 15.5465C21.0914 18.0115 17.8727 20.9567 14.875 22.7233C13.5094 21.9796 12.1649 20.6125 11.1775 18.6433C9.85152 15.9885 9.19419 13.1707 9.08935 10.9338C9.9011 10.9933 10.7653 11.084 11.662 11.1959C10.7497 12.7061 10.5641 14.2332 10.6392 14.8452C10.7029 15.3722 10.7667 15.4544 10.7695 15.4572C10.7667 15.4544 10.7384 15.3921 10.8715 14.4698C11.0203 13.4385 11.4835 12.4015 12.1083 11.5033C12.5616 14.1148 13.2317 16.6841 14.1114 19.1845C14.4089 20.0246 14.7305 20.8462 15.0719 21.6495L15.1272 21.6282L15.1428 21.6608C15.2915 21.6013 15.5083 21.5092 15.7406 21.3959C15.997 21.2712 16.1939 21.1664 16.3115 21.1012C16.235 20.8887 16.1585 20.672 16.0849 20.4538C15.0252 17.3456 14.0817 13.0701 14.0562 9.58655C15.1669 8.89805 16.6529 8.44189 18.4054 8.38805V8.38664ZM28.0288 10.9196C29.6891 11.9453 30.5618 13.0815 30.1042 13.9244C29.8464 14.2984 29.2471 14.382 28.6521 14.3593C27.9557 13.9998 27.2449 13.669 26.5214 13.3676C27.064 12.5431 27.5669 11.7215 28.0288 10.9196ZM26.5654 15.9035C28.4169 17.0694 29.7033 18.3968 29.8279 19.8092C29.8517 20.0467 29.8043 20.2858 29.6919 20.4963C29.6471 20.5738 29.5949 20.6469 29.5361 20.7145C29.1494 21.1437 28.4835 21.4086 27.8503 21.5942C26.9252 21.8634 25.3768 21.9866 24.6033 22.0334C24.667 21.9342 24.7308 21.8464 24.7945 21.7444C26.1729 19.4919 26.6263 17.5397 26.5654 15.9035ZM9.81752 18.326C9.88269 18.4506 9.93652 18.5711 10.0059 18.6957C11.2569 20.9992 12.7075 22.3649 14.144 23.1341C12.1975 24.1641 10.3941 24.6231 9.10352 24.0224C8.95396 23.9542 8.81989 23.8563 8.70954 23.7345C8.59919 23.6126 8.51488 23.4696 8.46177 23.3141C8.28752 22.7644 8.3881 22.0561 8.54394 21.4157C8.7791 20.4524 9.48177 18.9932 9.81752 18.326ZM16.3342 24.3794C16.7776 25.2648 17.2366 26.112 17.6999 26.9138C15.9829 27.8375 14.5662 28.0259 14.0647 27.2071C14.0406 27.1688 14.0279 27.1235 14.0123 27.0824C13.906 26.6857 14.1256 26.1856 14.4132 25.7295C15.0549 25.3186 15.6981 24.8639 16.3328 24.3794H16.3342Z"/>
  </svg>;

const DiscordIcon = ({ className }: PropsWithClassName<{}>) =>
  <svg className={className} viewBox="0 0 32 34" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M27.6478 0C29.6396 0 31.2461 1.61075 31.3411 3.50625V34L27.5486 30.7799L25.4661 28.8844L23.1938 26.9039L24.143 30.0277H4.2558C2.26964 30.0277 0.657471 28.5189 0.657471 26.52V3.51333C0.657471 1.61783 2.27247 0.00425 4.26289 0.00425H27.6379L27.6478 0ZM18.9806 8.05092H18.9381L18.652 8.33425C21.5887 9.18425 23.0096 10.5117 23.0096 10.5117C21.117 9.56533 19.4113 9.09217 17.7056 8.90092C16.4731 8.70967 15.2406 8.81025 14.1994 8.90092H13.9161C13.2502 8.90092 11.8336 9.18425 9.93522 9.94217C9.27364 10.2297 8.89397 10.4182 8.89397 10.4182C8.89397 10.4182 10.3135 8.99867 13.4415 8.24075L13.2502 8.0495C13.2502 8.0495 10.8816 7.95883 8.32447 9.84867C8.32447 9.84867 5.76739 14.3027 5.76739 19.7937C5.76739 19.7937 7.18405 22.2587 11.07 22.3522C11.07 22.3522 11.6366 21.5971 12.2104 20.9327C10.0287 20.2697 9.17872 18.9437 9.17872 18.9437C9.17872 18.9437 9.36855 19.0372 9.6533 19.227H9.7383C9.7808 19.227 9.80064 19.2482 9.8233 19.2695V19.278C9.84597 19.3007 9.8658 19.3205 9.9083 19.3205C10.3758 19.5132 10.8433 19.703 11.2258 19.8872C11.886 20.1733 12.7346 20.4581 13.7758 20.6465C15.0933 20.8377 16.6035 20.9298 18.3233 20.6465C19.1733 20.4552 20.0233 20.2682 20.8733 19.8886C21.4258 19.6052 22.1058 19.3219 22.8524 18.8445C22.8524 18.8445 22.0024 20.1705 19.7286 20.8335C20.1961 21.4937 20.8549 22.2502 20.8549 22.2502C24.7422 22.1652 26.2524 19.7002 26.3374 19.805C26.3374 14.3225 23.7661 9.86 23.7661 9.86C21.4499 8.14017 19.2824 8.075 18.8999 8.075L18.9792 8.04667L18.9806 8.05092ZM19.2186 14.3027C20.2146 14.3027 21.0178 15.1527 21.0178 16.1939C21.0178 17.2422 20.2103 18.0922 19.2186 18.0922C18.227 18.0922 17.4195 17.2423 17.4195 16.2024C17.4223 15.1541 18.2312 14.3069 19.2186 14.3069V14.3027ZM12.7827 14.3027C13.7744 14.3027 14.5762 15.1527 14.5762 16.1939C14.5762 17.2422 13.7687 18.0922 12.7771 18.0922C11.7854 18.0922 10.9779 17.2423 10.9779 16.2024C10.9779 15.1541 11.7854 14.3069 12.7771 14.3069L12.7827 14.3027Z" fill="currentColor"/>
  </svg>;

const FacebookIcon = ({ className }: PropsWithClassName<{}>) =>
  <svg className={className} viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M34 17.1034C34 7.71514 26.3882 0.103394 17 0.103394C7.61175 0.103394 0 7.71514 0 17.1034C0 25.5892 6.21633 32.6216 14.3438 33.8966V22.0178H10.0272V17.102H14.3438V13.3591C14.3438 9.09923 16.8824 6.74473 20.7655 6.74473C22.6242 6.74473 24.5707 7.07764 24.5707 7.07764V11.2611H22.4258C20.3136 11.2611 19.6548 12.5715 19.6548 13.9159V17.1034H24.3695L23.6158 22.0192H19.6548V33.898C27.7837 32.6216 34 25.5878 34 17.1034Z"
      fill="currentColor"/>
  </svg>;

const InstagramIcon = ({ className }: PropsWithClassName<{}>) =>
  <svg className={className} xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 169.063 169.063">
  <g>
    <path fill="currentColor" d="M122.406,0H46.654C20.929,0,0,20.93,0,46.655v75.752c0,25.726,20.929,46.655,46.654,46.655h75.752
      c25.727,0,46.656-20.93,46.656-46.655V46.655C169.063,20.93,148.133,0,122.406,0z M154.063,122.407
      c0,17.455-14.201,31.655-31.656,31.655H46.654C29.2,154.063,15,139.862,15,122.407V46.655C15,29.201,29.2,15,46.654,15h75.752
      c17.455,0,31.656,14.201,31.656,31.655V122.407z"/>
    <path fill="currentColor" d="M84.531,40.97c-24.021,0-43.563,19.542-43.563,43.563c0,24.02,19.542,43.561,43.563,43.561s43.563-19.541,43.563-43.561
      C128.094,60.512,108.552,40.97,84.531,40.97z M84.531,113.093c-15.749,0-28.563-12.812-28.563-28.561
      c0-15.75,12.813-28.563,28.563-28.563s28.563,12.813,28.563,28.563C113.094,100.281,100.28,113.093,84.531,113.093z"/>
    <path fill="currentColor" d="M129.921,28.251c-2.89,0-5.729,1.17-7.77,3.22c-2.051,2.04-3.23,4.88-3.23,7.78c0,2.891,1.18,5.73,3.23,7.78
      c2.04,2.04,4.88,3.22,7.77,3.22c2.9,0,5.73-1.18,7.78-3.22c2.05-2.05,3.22-4.89,3.22-7.78c0-2.9-1.17-5.74-3.22-7.78
      C135.661,29.421,132.821,28.251,129.921,28.251z"/>
  </g>
  </svg>;

const SteamIcon = ({ className }: PropsWithClassName<{}>) =>
  <svg className={className} viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16.9702 0C8.04379 0 0.723878 6.885 0.0311279 15.6357L9.14313 19.4012C9.91521 18.8757 10.8474 18.5654 11.8518 18.5654C11.941 18.5654 12.0289 18.5711 12.1181 18.5739L16.1712 12.7061V12.6225C16.1712 9.08792 19.0442 6.2135 22.5802 6.2135C26.1134 6.2135 28.9892 9.09075 28.9892 12.6267C28.9892 16.1628 26.1134 19.0372 22.5802 19.0372H22.4315L16.6571 23.1611C16.6571 23.2348 16.6628 23.3098 16.6628 23.3863C16.6628 26.0426 14.5165 28.1973 11.8603 28.1973C9.54404 28.1973 7.58763 26.5356 7.14138 24.3341L0.617628 21.6325C2.63779 28.7682 9.18846 34 16.9702 34C26.3585 34 33.9688 26.3882 33.9688 17C33.9688 7.61175 26.357 0 16.9702 0ZM10.6816 25.7975L8.59488 24.9333C8.96604 25.7026 9.60638 26.3486 10.4564 26.7042C12.2938 27.4678 14.4131 26.5965 15.1767 24.7563C15.5493 23.8638 15.5507 22.8877 15.1838 21.9952C14.8169 21.1027 14.1213 20.4071 13.233 20.0359C12.349 19.6676 11.4055 19.6832 10.5725 19.9934L12.7301 20.8859C14.0845 21.4526 14.7262 23.0109 14.1595 24.3638C13.5971 25.7196 12.0388 26.3613 10.683 25.7975H10.6816ZM26.8529 12.6182C26.8529 10.2637 24.9361 8.347 22.5816 8.347C20.2229 8.347 18.3104 10.2637 18.3104 12.6182C18.3104 14.977 20.2229 16.8895 22.5816 16.8895C24.9375 16.8895 26.8529 14.977 26.8529 12.6182ZM19.3828 12.6112C19.3828 10.8375 20.8179 9.401 22.5915 9.401C24.361 9.401 25.8017 10.8375 25.8017 12.6112C25.8017 14.3834 24.361 15.8199 22.5915 15.8199C20.8165 15.8199 19.3828 14.3834 19.3828 12.6112Z"
      fill="currentColor"/>
  </svg>;

const TwitterIcon = ({ className }: PropsWithClassName<{}>) =>
  <svg className={className} viewBox="0 0 34 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M33.9334 3.47413C32.6605 4.03457 31.312 4.40451 29.9313 4.57204C31.385 3.69831 32.4734 2.32811 32.9956 0.714461C31.6483 1.50071 30.1552 2.07304 28.5657 2.39179C27.517 1.2704 26.1274 0.526641 24.6127 0.276004C23.0979 0.0253679 21.5428 0.281882 20.1888 1.00571C18.8348 1.72955 17.7577 2.88019 17.1247 4.27897C16.4918 5.67775 16.3384 7.24638 16.6883 8.74129C10.8942 8.46788 5.76158 5.68413 2.32333 1.47946C1.69829 2.5417 1.37227 3.75325 1.37983 4.98571C1.37983 7.40821 2.61233 9.53746 4.4795 10.7884C3.37288 10.7532 2.29071 10.454 1.32317 9.91571V10.0007C1.32254 11.6106 1.87888 13.1711 2.8978 14.4175C3.91672 15.6639 5.33547 16.5195 6.91333 16.839C5.89092 17.1129 4.82009 17.1541 3.77967 16.9594C4.22751 18.3449 5.09669 19.556 6.26594 20.4238C7.43518 21.2916 8.84616 21.7728 10.302 21.8001C7.83633 23.7352 4.79184 24.7855 1.6575 24.7822C1.105 24.7822 0.553917 24.7496 0 24.6873C3.19559 26.7334 6.91123 27.8195 10.7057 27.8167C23.5308 27.8167 30.5362 17.1974 30.5362 8.00463C30.5362 7.70713 30.5363 7.40963 30.515 7.11213C31.8835 6.12735 33.0639 4.9047 34 3.50246L33.9334 3.47413Z"
      fill="currentColor"/>
  </svg>;

const UplayIcon = ({ className }: PropsWithClassName<{}>) =>
  <svg className={className} viewBox="0 0 33 34" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M32.7562 16.9828C32.3878 -0.430839 9.22958 -6.92767 0.307417 9.39799C0.706917 9.68983 1.24383 10.0737 1.64333 10.35C0.985278 11.728 0.520023 13.19 0.260667 14.6949C0.0882373 15.6634 0.00101474 16.6451 0 17.6288C0 26.6587 7.34117 33.9998 16.3852 33.9998C25.4306 33.9998 32.7562 26.6757 32.7562 17.6288V16.9842V16.9828ZM4.04033 19.9012C3.825 21.6663 3.96383 22.2188 3.96383 22.4342L3.56433 22.573C3.41133 22.2812 3.04017 21.2527 2.873 19.87C2.44233 14.6028 6.03642 9.85983 11.5189 8.96733C16.5396 8.23066 21.3463 11.3473 22.4669 15.7078L22.0674 15.8467C21.9442 15.7234 21.7444 15.3707 20.9766 14.6028C14.9118 8.53808 5.39042 11.3162 4.03892 19.9012H4.04033ZM19.6265 22.8492C19.216 23.4423 18.6676 23.9268 18.0285 24.2612C17.3894 24.5956 16.6786 24.7698 15.9573 24.7688C15.3701 24.7698 14.7885 24.6548 14.2458 24.4305C13.7031 24.2062 13.21 23.877 12.7948 23.4618C12.3796 23.0466 12.0504 22.5535 11.8261 22.0108C11.6018 21.4681 11.4868 20.8865 11.4878 20.2992C11.4901 19.1708 11.9186 18.0849 12.6875 17.259C13.4564 16.4331 14.5089 15.9281 15.6343 15.8452C17.0765 15.7843 18.428 16.5677 19.057 17.8257C19.3959 18.5033 19.5159 19.2693 19.4004 20.018C19.285 20.7667 18.9397 21.461 18.4124 22.0049C18.8275 22.2953 19.227 22.5716 19.6251 22.8478L19.6265 22.8492ZM28.9482 23.0192C26.5837 28.3771 21.7147 31.1877 16.524 31.1112C6.55917 30.6197 3.65642 19.1177 10.319 14.9712L10.6122 15.263C10.5046 15.416 10.1051 15.7234 9.49167 16.9375C8.76917 18.4122 8.53967 19.8856 8.63175 20.8078C9.1545 28.8403 20.4099 30.4837 24.2788 22.5277C29.2088 11.6406 16.1259 0.567911 4.51492 9.02966L4.25425 8.769C7.31 3.97783 13.2841 1.84149 18.9805 3.27091C27.6887 5.46674 32.3722 14.5419 28.9468 23.0192H28.9482Z"
      fill="currentColor"/>
  </svg>;

const WebsiteIcon = ({ className }: PropsWithClassName<{}>) =>
  <svg className={className} viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g clip-path="url(#clip0)">
    <path fill="currentColor" d="M29.0182 4.98139C22.3764 -1.66058 11.6249 -1.66165 4.98203 4.98139C-1.66002 11.6234 -1.66101 22.3747 4.98203 29.0176C11.6239 35.6596 22.3753 35.6606 29.0182 29.0176C35.6602 22.3757 35.6612 11.6244 29.0182 4.98139ZM28.3078 26.5949C27.5137 25.8848 26.6643 25.2563 25.7689 24.7148C26.3607 22.6705 26.7113 20.421 26.7942 18.0826H31.7911C31.5652 21.2345 30.3541 24.1912 28.3078 26.5949ZM2.20904 18.0826H7.20595C7.28882 20.421 7.63943 22.6705 8.23122 24.7148C7.33587 25.2563 6.48643 25.8848 5.69233 26.5949C3.64603 24.1912 2.43504 21.2345 2.20904 18.0826ZM5.69239 7.40417C6.48649 8.11427 7.33593 8.74269 8.23129 9.28426C7.63949 11.3285 7.28889 13.578 7.20601 15.9164H2.20904C2.43504 12.7646 3.64603 9.80784 5.69239 7.40417ZM15.917 9.50813C14.1506 9.38179 12.4474 8.94672 10.8685 8.22899C11.7868 5.86427 13.4797 3.02805 15.917 2.32518V9.50813ZM15.917 11.6784V15.9165H9.37307C9.44805 13.9384 9.72832 12.0389 10.1944 10.301C11.9888 11.0854 13.9186 11.5538 15.917 11.6784ZM15.917 18.0826V22.3207C13.9186 22.4453 11.9888 22.9137 10.1944 23.6981C9.72832 21.9602 9.44805 20.0607 9.37307 18.0826H15.917ZM15.917 24.491V31.6738C13.4798 30.971 11.7869 28.1351 10.8685 25.7701C12.4474 25.0524 14.1506 24.6173 15.917 24.491ZM18.0832 24.491C19.8496 24.6173 21.5528 25.0524 23.1318 25.7701C22.2134 28.1349 20.5206 30.971 18.0832 31.6738V24.491ZM18.0832 22.3207V18.0826H24.6271C24.5522 20.0607 24.2719 21.9602 23.8058 23.6981C22.0114 22.9137 20.0816 22.4453 18.0832 22.3207ZM18.0832 15.9165V11.6784C20.0816 11.5538 22.0114 11.0854 23.8058 10.301C24.2719 12.0389 24.5522 13.9384 24.6271 15.9165H18.0832ZM18.0832 9.50813V2.32525C20.5206 3.02812 22.2135 5.86434 23.1318 8.22906C21.5528 8.94672 19.8496 9.38179 18.0832 9.50813ZM22.9481 3.40659C24.3345 4.01371 25.628 4.83694 26.7875 5.85837C26.2356 6.34499 25.6532 6.78623 25.0451 7.18083C24.5051 5.8437 23.8152 4.54426 22.9481 3.40659ZM8.95506 7.18083C8.34694 6.78623 7.76463 6.34499 7.21265 5.85837C8.37215 4.83694 9.66562 4.01371 11.052 3.40659C10.185 4.5444 9.4951 5.84384 8.95506 7.18083ZM8.95512 26.8183C9.4951 28.1553 10.1851 29.4548 11.0521 30.5925C9.66569 29.9854 8.37222 29.1621 7.21272 28.1407C7.76463 27.6541 8.34701 27.2129 8.95512 26.8183ZM25.0451 26.8183C25.6532 27.2129 26.2356 27.6541 26.7875 28.1407C25.628 29.1621 24.3345 29.9853 22.9481 30.5924C23.8151 29.4549 24.5051 28.1554 25.0451 26.8183ZM26.7943 15.9165C26.7114 13.5781 26.3608 11.3285 25.769 9.28432C26.6644 8.74276 27.5137 8.11434 28.3079 7.40424C30.3542 9.80784 31.5652 12.7646 31.7912 15.9165H26.7943Z"/>
  </g>
  <defs>
    <clipPath id="clip0">
      <rect width="34" height="34" fill="currentColor"/>
    </clipPath>
  </defs>
  </svg>;

const TwitchIcon = ({ className }: PropsWithClassName<{}>) =>
  <svg className={className} viewBox="0 0 30 34" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path
    d="M14.3923 6.67817H16.8219V13.9641H14.3909L14.3923 6.67817ZM21.0719 6.67817H23.5001V13.9641H21.0719V6.67817ZM6.50006 0L0.428223 6.07183V27.9282H7.71414V34L13.786 27.9282H18.6423L29.5719 17V0H6.50006ZM27.1423 15.7859L22.286 20.6423H17.4282L13.1782 24.8922V20.6423H7.71414V2.42817H27.1423V15.7859Z"
    fill="currentColor"/>
  </svg>;

const OriginIcon = ({ className }: PropsWithClassName<{}>) =>
  <svg className={className} viewBox="0 0 26 34" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M13.833 4.40589C15.5182 4.50685 17.1653 4.94982 18.6738 5.70781C20.1339 6.43552 21.4365 7.44351 22.5073 8.67431C23.575 9.90745 24.3994 11.3318 24.9369 12.8719C25.4954 14.4627 25.7197 16.1516 25.5956 17.8331C25.5508 18.7194 25.4049 19.5978 25.1607 20.4511C24.9237 21.2851 24.6038 22.0933 24.2059 22.8636C23.5932 24.0504 22.8973 25.1922 22.1234 26.2806C21.3709 27.3445 20.5363 28.3477 19.6272 29.2811C17.8399 31.1173 15.7944 32.6832 13.5554 33.9292L13.5029 33.9661C13.4557 33.9916 13.4021 34.0029 13.3485 33.9986C13.2605 33.9786 13.1814 33.9303 13.1233 33.8612C13.0658 33.7926 13.0347 33.7057 13.0354 33.6161C13.0354 33.5751 13.0411 33.5326 13.0524 33.4957C13.064 33.4633 13.0818 33.4335 13.1048 33.4079C13.4973 32.8511 13.8217 32.2661 14.0767 31.6583C14.3334 31.042 14.5087 30.3947 14.598 29.7331C14.5977 29.7104 14.5927 29.688 14.5835 29.6673C14.5742 29.6466 14.5609 29.628 14.5442 29.6126C14.5293 29.5954 14.5108 29.5817 14.49 29.5724C14.4691 29.5631 14.4466 29.5584 14.4238 29.5588C14.0498 29.6044 13.674 29.6337 13.2975 29.6466C12.9208 29.6596 12.5437 29.6421 12.1698 29.5942C10.5129 29.4947 8.89244 29.066 7.40308 28.3331C5.91372 27.6003 4.58536 26.5779 3.4956 25.3258C2.42716 24.0931 1.60267 22.6687 1.06602 21.1282C0.507955 19.5373 0.283709 17.8485 0.407267 16.1671C0.451589 15.2807 0.597032 14.4024 0.840767 13.5491C1.07487 12.7243 1.39539 11.9265 1.79702 11.1691C2.41893 9.94506 3.11452 8.79472 3.8781 7.71806C4.63147 6.65532 5.46501 5.65175 6.37143 4.71614C8.16234 2.88358 10.2083 1.31904 12.4461 0.0708891L12.4999 0.0354724C12.547 0.00790743 12.6014 -0.00446103 12.6558 5.57709e-05C12.7429 0.0212768 12.8209 0.0699509 12.8782 0.138889C12.9372 0.207192 12.9686 0.295133 12.966 0.385389C12.9673 0.425744 12.9616 0.46602 12.949 0.504389C12.9385 0.536566 12.9211 0.566059 12.898 0.590806C12.5103 1.13747 12.1839 1.72514 11.9248 2.34322C11.6698 2.95664 11.4998 3.59697 11.4063 4.26706C11.4063 4.31381 11.4233 4.35631 11.4573 4.38889C11.4727 4.40537 11.4914 4.41852 11.5121 4.42753C11.5328 4.43655 11.5551 4.44123 11.5777 4.44131C11.9489 4.39456 12.3243 4.36622 12.7039 4.35631C13.0893 4.34214 13.4633 4.35914 13.8344 4.40447L13.833 4.40589ZM12.6898 21.9258C13.3364 21.9813 13.9876 21.9023 14.6022 21.6938C15.2168 21.4853 15.7817 21.1519 16.2612 20.7146C17.2812 19.8079 17.8337 18.6774 17.9272 17.3146C17.9821 16.6648 17.9027 16.0107 17.6941 15.3929C17.4855 14.7751 17.1521 14.2068 16.7145 13.7233C16.2938 13.2271 15.7741 12.8243 15.1885 12.5408C14.603 12.2573 13.9647 12.0994 13.3145 12.0771C12.6651 12.0225 12.0114 12.1019 11.3939 12.3102C10.7764 12.5186 10.2083 12.8515 9.72468 13.2884C9.22834 13.7092 8.8253 14.2289 8.54135 14.8144C8.2574 15.3998 8.0988 16.0381 8.07568 16.6884C8.02094 17.337 8.09899 17.99 8.30505 18.6075C8.51111 19.2249 8.84087 19.7939 9.27418 20.2796C10.1638 21.3067 11.3028 21.8592 12.6898 21.9258Z"
      fill="currentColor"/>
  </svg>;




const iconMap = {
  "accept": AcceptIcon,
  "add": AddIcon,
  "arrowDown": ArrowDownIcon,
  "apply": AddIcon,
  "clock": AddIcon,
  "decline": DeclineIcon,
  "edit": EditIcon,
  "envelope": EnvelopeIcon,
  "logo": SESFLogoIcon,
  "remove": AddIcon,
  "organisation": OrganisationIcon,
  "search": SearchIcon,
  "signIn": SignInIcon,
  "team": TeamIcon,
  "user": UserIcon,
  "star": StarIcon,
  "battlenet": BattleNetIcon,
  "discord": DiscordIcon,
  "facebook": FacebookIcon,
  "instagram": InstagramIcon,
  "steam": SteamIcon,
  "twitter": TwitterIcon,
  "uplay": UplayIcon,
  "website": WebsiteIcon,
  "twitch": TwitchIcon,
  "origin": OriginIcon
};

export type IconType = "accept" | "add" | "arrowDown" | "apply" | "clock" | "decline" | "edit" | "envelope" | "logo" | "remove" | "organisation" | "search" | "signIn" | "team" | "user" | "star" | "battlenet" | "discord" | "facebook" | "instagram" | "steam" | "uplay" | "website" | "twitch" | "origin";

type IconPropType = {
  iconName: IconType
}

export default function({ className, iconName }: PropsWithClassName<IconPropType>) {
  const Icon = iconMap[iconName];
  return <Icon className={className}/>;
}
