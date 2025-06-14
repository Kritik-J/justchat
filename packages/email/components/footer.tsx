import { Hr, Text } from "@react-email/components";

// Footer Component
const Footer = () => {
  return (
    <>
      <Hr className="border-neutral-200 my-4" />
      <Text className="text-neutral-500 text-xs text-center">
        &copy; {new Date().getFullYear()} flexbook. All rights reserved.
      </Text>
    </>
  );
};

export default Footer;
