import H1 from "~/components/Titles/H1";
import Icon from "~/components/Icon";

const Verify = () => {
  return <>
    <div className='w-full my-auto flex flex-col items-center justify-center'>
      <H1>Check your mail to verify your account and log in again</H1>
      <Icon path={'/assets/envelope.svg'}
            className='text-black dark:text-white flex justify-center items-center w-1/2 mb-5'/>
    </div>
  </>;
};

export default Verify;
