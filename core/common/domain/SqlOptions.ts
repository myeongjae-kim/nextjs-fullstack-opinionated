/**
 * drizzle은 Spring Boot와는 다르게 트랜잭션 읽기전용 여부(replica 사용 여부)를 thread local로 관리하는 기능이 없기 때문에
 * 명시적으로 트랜잭션 설정을 전달해야 한다.
 * 
 * primary와 replica 모두 사용이 가능한 비즈니스 로직(=쓰기가 없음)의 경우 매개변수로 SqlOptions을 받도록 작성해서
 * 로직의 가장 바깥쪽에서 읽기전용 여부를 선택할 수 있게 한다.
 * 
 * 쓰기 로직이 있어서 primary db만 사용해야 하는 비즈니스 로직의 경우는 매개변수에 SqlOptions를 받지 않도록 해서
 * replica 사용 옵션이 불가능하다는 것을 표현한다.
 */
export interface SqlOptions {
  useReplica: boolean;
}
