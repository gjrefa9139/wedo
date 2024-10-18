"use client";

import { useState, ChangeEvent, FormEvent } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/@common/Button";
import Input from "@/components/@common/Input";
import Container from "@/components/@common/container/Container";
import { useToast } from "@/hooks/useToast";
import { useAcceptInvitation } from "@/queries/group";

export default function JoinTeamPage() {
  const [teamToken, setTeamToken] = useState("");
  const [inputErrorMessage, setInputErrorMessage] = useState("");

  const { mutate: acceptInvitation } = useAcceptInvitation();

  const { toast } = useToast();
  const router = useRouter();

  // token input이 변경되었을 때, input의 error message를 상태로 관리해서 변경해주는 핸들러
  const handleTokenInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTeamToken(e.target.value);

    if (inputErrorMessage) {
      setInputErrorMessage("");
    }
  };

  // 모달의 팀 참여하기 버튼을 눌렀을 때, input을 체크하고 mutate 함수를 실행하는 핸들러
  const handleTokenSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!teamToken) {
      setInputErrorMessage("토큰을 입력해주세요!");
      return;
    }

    acceptInvitation(teamToken, {
      onError: (error) => {
        if (error.message === "jwt expired") {
          setInputErrorMessage(
            "초대 토큰이 만료되었습니다. 재발급이 필요합니다.",
          );
        } else {
          setInputErrorMessage(error.message);
        }
      },
      onSuccess: (response) => {
        (() => toast({ title: "팀 참여에 성공했습니다!" }))();

        const { groupId: teamId } = response;
        router.push(`/${teamId}`);
      },
    });
  };

  return (
    <Container background="lightBeige">
      <form
        className="mx-auto pt-[72px] tab:w-[460px] tab:pt-[100px] pc:pt-[140px]"
        onSubmit={handleTokenSubmit}
      >
        <h1 className="2xl-medium mb-6 text-center text-default-light pc:4xl-medium tab:mb-20">
          팀 참여하기
        </h1>
        <label htmlFor="token">
          <h3 className="lg-medium mb-3 text-default-light">팀 링크</h3>
        </label>
        <Input
          id="token"
          Error={!!inputErrorMessage}
          ErrorMessage={inputErrorMessage}
          onChange={handleTokenInputChange}
          placeholder="팀 토큰을 입력해주세요."
          value={teamToken}
        />
        <Button className="mb-6 mt-10 w-full" type="submit">
          참여하기
        </Button>
        <p className="lg-normal text-center text-default-light">
          공유받은 팀 토큰을 입력해 참여할 수 있어요.
        </p>
      </form>
    </Container>
  );
}