import H1 from "~/components/Titles/H1";
import Icon from "~/components/Icons";

const Verify = () => {
  return <>
    <div className='w-full my-auto flex flex-col items-center justify-center'>
      <Icon iconName='envelope' className='text-color flex justify-center items-center w-16 max-w-1/2 mb-5'/>
      <H1>Check your mail to verify your account and log in again</H1>
    </div>
  </>;
};

export default Verify;
