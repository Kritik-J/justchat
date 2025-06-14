import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Tailwind,
  Img,
  Button,
} from "@react-email/components";

const MagicLink = ({
  email = "user@example.com",
  link = "https://example.com",
  expiryTime = "10",
  logoUrl = "../flexbook.svg",
}) => {
  const companyName = "Flexbook";

  return (
    <Html>
      <Head />
      <Preview>Your {companyName} magic link</Preview>
      <Tailwind>
        <Body className="bg-neutral-100 font-sans">
          <Container className="mx-auto p-4 max-w-md">
            <Section className="bg-white p-6 shadow-sm border border-neutral-200">
              <Section className="text-center mb-6">
                <Img
                  src={logoUrl}
                  width="200"
                  height="50"
                  alt={companyName}
                  className="mx-auto"
                />
              </Section>

              <Heading className="text-xl font-bold text-center text-neutral-800">
                Magic Link
              </Heading>

              <Text className="text-neutral-700">Hello {email},</Text>

              <Text className="text-neutral-700">
                Click the button below to complete your login:{" "}
              </Text>

              <Button className="my-4" href={link}>
                Click here to login
              </Button>

              <Text className="text-neutral-600 text-sm">
                This link will expire in {expiryTime} minutes. If you didn't
                request this code, please ignore this email or contact support
                if you have concerns.
              </Text>

              <Hr className="border-neutral-200 my-4" />

              <Text className="text-neutral-500 text-xs text-center">
                &copy; {new Date().getFullYear()} {companyName}. All rights
                reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default MagicLink;
