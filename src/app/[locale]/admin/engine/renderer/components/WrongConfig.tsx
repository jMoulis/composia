type Props = {
  type: string;
  message: string;
};
function WrongConfig({ message }: Props) {
  return <p className='text-red-700 text-xs'>❌ {message}</p>;
}
export default WrongConfig;
