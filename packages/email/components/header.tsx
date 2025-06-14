import { Img, Section } from "@react-email/components";

// Header Component
const Header = () => {
  return (
    <Section className="text-center mb-6">
      <Img
        src={"./flexbook.svg"}
        width="200"
        height="50"
        alt="flexbook"
        className="mx-auto"
      />
    </Section>
  );
};

export default Header;
