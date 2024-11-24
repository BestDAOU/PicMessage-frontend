import React, { useState, useEffect } from "react";
import axios from "axios";
import tonesobj from "../data/tones.json";
import MessageAnimation from "../components/MessageAnimation";
import Message2Animation from "../components/MessageAnimation";

const PersonalizationModal = ({
  selectedContacts,
  closeModal,
  convertedTexts,
  setConvertedTexts,
  onComplete,
  message,
}) => {
  // 톤 선택 버튼을 렌더링하기 위한 톤 목록
  const tones = tonesobj;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedTones, setSelectedTones] = useState({}); // 선택된 톤 상태

  const currentContact = selectedContacts[currentIndex];
  const { tag, memo } = currentContact; // 현재 선택된 연락처의 tag와 memo 가져오기
  const [isHovering, setIsHovering] = useState(false);
  const [selectedToneExamples, setSelectedToneExamples] = useState([]);
  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  const handleToneSelection = (toneInstruction) => {
    if (currentContact) {
      const tone = tones.find((tone) => tone.instruction === toneInstruction);
      setSelectedTones((prev) => ({
        ...prev,
        [currentContact.id]: toneInstruction,
      }));
      setSelectedToneExamples(tone ? tone.examples : []); // 선택된 어조의 예시 설정
    }
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      Math.min(prevIndex + 1, selectedContacts.length - 1)
    );
  };
  // 현재 연락처의 기본 선택된 어조 설정
  useEffect(() => {
    if (currentContact) {
      // 이미 선택된 어조가 있으면 유지, 없으면 기본 어조로 초기화
      setSelectedTones((prev) => {
        if (prev[currentContact.id]) return prev; // 기존 선택값 유지
        const defaultTone = tones.find(
          (tone) => tone.label === currentContact.tone
        );
        return {
          ...prev,
          [currentContact.id]: defaultTone
            ? defaultTone.instruction
            : "기본 말투로",
        };
      });
    }
  }, [currentContact, tones]);

  const handleConvert = async () => {
    const textToConvert = convertedTexts[currentContact.id] || "";
    if (!textToConvert) {
      alert("변환할 텍스트를 입력하세요.");
      return;
    }
    const selectedToneInstruction = selectedTones[currentContact.id];
    const selectedToneData = tones.find(
      (tone) => tone.instruction === selectedToneInstruction
    );
    if (!selectedToneData) {
      alert("선택된 톤에 대한 데이터를 찾을 수 없습니다.");
      return;
    }

    const { instruction, examples } = selectedToneData;

    // 모든 예시를 프롬프트에 포함
    const examplesText = examples
      .map((example, index) => `Example ${index + 1}: "${example}"`)
      .join("\n");

    const prompt = `
    Please rewrite the following message in a tone that is described as follows:
    "${instruction}"
    The message should reflect the person's characteristics, notes, and the given examples.
    The response must be written in Korean and should address the recipient by their name.

    Original message: "${textToConvert}"
    Recipient's name: "${currentContact.name}"
    Tags: "${tag}"
    Memo: "${memo}"
    Examples for this tone:
    ${examplesText}
  `;
    setLoading(true);
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4-turbo",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 1000,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          },
        }
      );

      //ContactList의 convertedTexts값 변경
      setConvertedTexts((prev) => ({
        ...prev,
        [currentContact.id]: response.data.choices[0].message.content.trim(),
      }));
    } catch (error) {
      console.error(
        "API 호출 오류:",
        error.response ? error.response.data : error.message
      );
      alert("텍스트 변환에 실패했습니다. 다시 시도해주세요.");
    }
    setLoading(false);
  };

  const handleTextChange = (e) => {
    const { value } = e.target;
    setConvertedTexts((prev) => ({
      ...prev,
      [currentContact.id]: value,
    }));
  };

  const initMessage = () => {
    setConvertedTexts((prev) => ({
      ...prev,
      [currentContact.id]: message, // 현재 연락처의 텍스트를 기본 메시지로 변경
    }));
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        {loading && <MessageAnimation />}
        {/* 왼쪽 영역 */}
        <div style={styles.leftSection}>
          <h2 style={styles.title}>텍스트 개인 맞춤화</h2>
          {currentContact && (
            <>
              <div style={styles.inputGroup}>
                <label>이름:</label>
                <input
                  type="text"
                  value={currentContact.name}
                  readOnly
                  style={styles.inputField}
                />
              </div>
              <div style={styles.inputGroup}>
                <label>특징:</label>
                <input
                  type="text"
                  value={currentContact.tag}
                  readOnly
                  style={styles.inputField}
                />
              </div>
              <div style={styles.inputGroup}>
                <label>기억:</label>
                <input
                  type="text"
                  value={currentContact.memo}
                  readOnly
                  style={styles.inputField}
                />
              </div>
              <div style={styles.toneSelection}>
                <label>어조 선택:</label>
                <div style={styles.toneButtons}>
                  {tones.map((tone) => (
                    <button
                      key={tone.label}
                      type="button"
                      style={{
                        ...styles.toneButton,
                        backgroundColor:
                          selectedTones[currentContact.id] === tone.instruction
                            ? "#4A90E2"
                            : "#e1e5f2",
                        color:
                          selectedTones[currentContact.id] === tone.instruction
                            ? "white"
                            : "black",
                      }}
                      onClick={() => handleToneSelection(tone.instruction)}
                    >
                      {tone.label}
                    </button>
                  ))}
                </div>
                {/* 선택된 어조의 예시 표시 */}
                {/* 예시 설명 및 렌더링 */}
                <div style={styles.examples}>
                  {selectedToneExamples.length > 0 ? (
                    <>
                      <p style={styles.examplesDescription}>
                        해당 말투는 이런 예시들을 참고합니다:
                      </p>
                      {selectedToneExamples.map((example, index) => (
                        <div key={index} style={styles.exampleCard}>
                          <p style={styles.exampleText}>
                            <strong>예시 {index + 1}: </strong>
                            {example}
                          </p>
                        </div>
                      ))}
                    </>
                  ) : (
                    <p style={styles.noExampleText}>예시가 없습니다.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* 오른쪽 영역 */}
        <div style={styles.rightSection}>
          <div style={styles.convertSection}>
            <span style={styles.convertLabel}>텍스트 변환</span>
            <button
              type="button"
              style={styles.convertButton}
              onClick={handleConvert}
              disabled={loading}
            >
              {loading ? "변환 중..." : "변환"}
            </button>
            <button
              type="button"
              onClick={initMessage}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              style={{
                ...styles.resetButton,
                ...(isHovering && styles.resetButtonHover), // hover 시 추가 스타일 적용
              }}
            >
              ↺ 되돌리기
            </button>
          </div>
          <textarea
            style={styles.textArea}
            value={convertedTexts[currentContact.id] || ""}
            onChange={handleTextChange}
            placeholder="여기에 텍스트가 표시됩니다."
          />
          <div style={styles.pagination}>
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              style={styles.navButton}
            >
              이전
            </button>
            <span style={styles.pageInfo}>
              {currentIndex + 1} / {selectedContacts.length}
            </span>
            <button
              onClick={handleNext}
              disabled={currentIndex === selectedContacts.length - 1}
              style={styles.navButton}
            >
              다음
            </button>
          </div>
          <div style={styles.buttonGroup}>
            <button onClick={closeModal} style={styles.closeButton}>
              닫기
            </button>
            <button onClick={onComplete} style={styles.completeButton}>
              완료
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
const styles = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "12px",
    width: "1200px", // 너비 증가
    height: "900px", // 높이 증가
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    zIndex: 1001,
    display: "flex", // 좌우 레이아웃
    gap: "20px", // 좌우 간격
    overflowY: "auto",
  },
  leftSection: {
    flex: 1.7, // 왼쪽 섹션 크기 조정
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  rightSection: {
    flex: 1.4, // 오른쪽 섹션 크기 조정
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  textArea: {
    flex: 1, // 오른쪽 영역에서 입력창이 충분히 커지도록
    marginTop: "15px",
    padding: "12px",
    fontSize: "18px",
    lineHeight: "1.6", // 줄 간격 조정 (가독성 향상)
    borderRadius: "6px",
    border: "1px solid #ccc",
    resize: "none",
    boxSizing: "border-box",
    height: "400px",
  },
  pagination: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px", // 닫기와 완료 버튼 간격 추가
    marginTop: "20px",
  },
  title: {
    marginBottom: "20px",
    fontSize: "22px",
    fontWeight: "bold",
    color: "#4A90E2", // 제목 색상
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "10px", // 이름, 특징, 메모 간격
  },
  inputField: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    width: "100%",
    boxSizing: "border-box",
  },
  toneButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "5px",
  },
  toneButton: {
    padding: "12px 12px",
    border: "1px solid white",
    borderRadius: "20px",
    cursor: "pointer",
    backgroundColor: "#FFFFFF",
    color: "black",
  },
  convertSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "10px",
  },
  convertLabel: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#4A90E2", // 라벨 색상
  },
  convertButton: {
    backgroundColor: "#4A90E2", // 버튼 색상
    color: "white",
    border: "none",
    padding: "8px 15px",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },

  navButton: {
    backgroundColor: "#4A90E2", // 네비게이션 버튼 색상
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  pageInfo: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#4A90E2", // 페이지 정보 색상
  },

  closeButton: {
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    padding: "12px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    width: "48%",
    transition: "background-color 0.3s",
  },
  completeButton: {
    backgroundColor: "#4A90E2", // 완료 버튼 색상
    color: "white",
    border: "none",
    padding: "12px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    width: "48%",
    transition: "background-color 0.3s",
  },
  resetButton: {
    backgroundColor: "white", // 흰색 배경
    color: "black", // 검은 텍스트
    borderWidth: "3px", // 테두리 두께
    borderStyle: "solid", // 테두리 스타일
    borderColor: "#d3d3d3", // 테두리 색상
    padding: "4px 13px",
    borderRadius: "6px",
    cursor: "pointer",
    marginLeft: "auto", // 오른쪽 정렬
    transition: "all 0.3s ease", // 부드러운 hover 효과
  },
  resetButtonHover: {
    backgroundColor: "#f0f0f0", // hover 시 밝은 회색 배경
    borderColor: "#b0b0b0", // hover 시 테두리 색상 변경
    transform: "scale(1.02)", // 약간 커짐
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // 눌리는 느낌의 그림자
  },
  examples: {
    marginTop: "20px", // 어조 선택 버튼과 예시 간의 간격
    padding: "15px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  },
  examplesDescription: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#4A90E2",
    marginBottom: "15px", // 설명과 예시 카드 간의 간격
  },
  exampleCard: {
    backgroundColor: "#ffffff",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    marginBottom: "15px", // 각 예시 카드 간의 간격
    boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
  },
  exampleText: {
    fontSize: "14px",
    color: "#333",
    lineHeight: "1.5",
  },
  noExampleText: {
    fontSize: "14px",
    color: "#999",
    textAlign: "center",
  },
};

export default PersonalizationModal;
